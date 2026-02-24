from typing import Any

import numpy as np
from fastapi import FastAPI
from pydantic import BaseModel
from sklearn.cluster import KMeans
from sklearn.metrics.pairwise import cosine_similarity

app = FastAPI(title='Ravi AI Matching Engine', version='1.0.0')

TAG_INDEX = {
    'tech': 0,
    'wellness': 1,
    'business': 2,
    'art': 3,
    'sports': 4,
    'gaming': 5,
    'networking': 6,
    'mindfulness': 7,
}
PERSONALITY_INDEX = {'analytical': 0, 'social': 1, 'creative': 2, 'structured': 3}
EVENT_TYPE_INDEX = {'workshop': 0, 'meetup': 1, 'bootcamp': 2, 'webinar': 3}


class Profile(BaseModel):
    userId: str
    interests: list[str] = []
    personalityTraits: list[str] = []
    preferredEventTypes: list[str] = []
    city: str | None = None


class Event(BaseModel):
    id: str
    tags: list[str] = []
    targetPersonalityTraits: list[str] = []
    eventType: str | None = None
    city: str | None = None


class MatchRequest(BaseModel):
    event: Event
    users: list[Profile]


def binary_vector(values: list[str], index: dict[str, int]) -> np.ndarray:
    vector = np.zeros(len(index), dtype=float)
    for value in values:
        key = value.strip().lower()
        if key in index:
            vector[index[key]] = 1.0
    return vector


def safe_cosine(a: np.ndarray, b: np.ndarray) -> float:
    if np.linalg.norm(a) == 0 or np.linalg.norm(b) == 0:
        return 0.0
    return float(cosine_similarity(a.reshape(1, -1), b.reshape(1, -1))[0][0])


@app.get('/health')
def health() -> dict[str, str]:
    return {'status': 'ok'}


@app.post('/match')
def match_users(payload: MatchRequest) -> dict[str, Any]:
    event = payload.event
    users = payload.users

    user_vectors = [
        np.concatenate(
            [
                binary_vector(user.interests, TAG_INDEX),
                binary_vector(user.personalityTraits, PERSONALITY_INDEX),
                binary_vector(user.preferredEventTypes, EVENT_TYPE_INDEX),
            ]
        )
        for user in users
    ]

    if len(user_vectors) > 0:
        n_clusters = max(1, min(5, len(user_vectors)))
        kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init='auto')
        cluster_labels = kmeans.fit_predict(np.array(user_vectors))
    else:
        cluster_labels = []

    event_interest = binary_vector(event.tags, TAG_INDEX)
    event_personality = binary_vector(event.targetPersonalityTraits, PERSONALITY_INDEX)
    event_type_vector = binary_vector([event.eventType] if event.eventType else [], EVENT_TYPE_INDEX)

    matches = []
    for idx, user in enumerate(users):
        interest_score = safe_cosine(binary_vector(user.interests, TAG_INDEX), event_interest)
        personality_score = safe_cosine(
            binary_vector(user.personalityTraits, PERSONALITY_INDEX),
            event_personality,
        )
        city_score = 1.0 if user.city and event.city and user.city.lower() == event.city.lower() else 0.2
        event_type_score = safe_cosine(
            binary_vector(user.preferredEventTypes, EVENT_TYPE_INDEX),
            event_type_vector,
        )

        final_score = round(
            0.35 * personality_score + 0.35 * interest_score + 0.15 * city_score + 0.15 * event_type_score,
            4,
        )

        matches.append(
            {
                'userId': user.userId,
                'eventId': event.id,
                'personalityScore': round(personality_score, 4),
                'interestsScore': round(interest_score, 4),
                'cityScore': round(city_score, 4),
                'eventTypeScore': round(event_type_score, 4),
                'finalScore': final_score,
                'scoringExplanation': (
                    f"Cluster {int(cluster_labels[idx]) if len(cluster_labels) else 0}: "
                    f"Personality {personality_score:.2f}, Interests {interest_score:.2f}, "
                    f"City {city_score:.2f}, EventType {event_type_score:.2f}."
                ),
                'scoringBreakdown': {
                    'weights': {
                        'personality': 0.35,
                        'interests': 0.35,
                        'city': 0.15,
                        'eventType': 0.15,
                    },
                    'clusterId': int(cluster_labels[idx]) if len(cluster_labels) else 0,
                    'rawScores': {
                        'personality': personality_score,
                        'interests': interest_score,
                        'city': city_score,
                        'eventType': event_type_score,
                    },
                },
            }
        )

    return {'matches': sorted(matches, key=lambda item: item['finalScore'], reverse=True)}
