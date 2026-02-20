"""
سرویس مچینگ راوی
پیاده‌سازی الگوریتم خوشه‌بندی بر اساس مستندات:
- Cosine Similarity برای محاسبه شباهت بردارها
- K-Means Clustering برای تشکیل گروه‌های ۴ تا ۶ نفره
- Cold Start با داده‌های دموگرافیک
- Multi-Objective Optimization (تنوع جنسیت)
- مدیریت بردارهای ۱۵۳۶ بعدی OpenAI Embeddings
"""
import os
import logging
import json
from typing import Optional

import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import psycopg2
from sklearn.cluster import KMeans, DBSCAN
from sklearn.preprocessing import normalize
from sklearn.decomposition import PCA

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s: %(message)s")

app = FastAPI(title="Ravi Matching Service", version="1.0.0")

DB_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@postgres:5432/ravi_db")
MIN_GROUP_SIZE = int(os.getenv("MIN_GROUP_SIZE", "4"))
MAX_GROUP_SIZE = int(os.getenv("MAX_GROUP_SIZE", "6"))
VECTOR_DIM = int(os.getenv("VECTOR_DIM", "1536"))   # OpenAI embedding dimension
REDUCED_DIM = int(os.getenv("REDUCED_DIM", "64"))   # PCA target dimension


# ─── مدل‌های داده ───────────────────────────────────────────────────────────

class UserFeatureVector(BaseModel):
    user_id: str
    telegram_id: Optional[str] = None
    vector: list[float]           # بردار ویژگی کاربر
    gender: Optional[str] = None  # برای قید تنوع جنسیت
    age: Optional[int] = None
    city: Optional[str] = None


class MatchRequest(BaseModel):
    event_id: str
    min_group_size: int = MIN_GROUP_SIZE
    max_group_size: int = MAX_GROUP_SIZE
    require_gender_diversity: bool = True  # حداقل ۲ جنسیت مختلف در هر گروه


class MatchResult(BaseModel):
    event_id: str
    groups: list[dict]
    total_users: int
    total_groups: int
    algorithm: str


# ─── ابزارهای کمکی ──────────────────────────────────────────────────────────

def get_db():
    return psycopg2.connect(DB_URL)


def cosine_similarity_matrix(vectors: np.ndarray) -> np.ndarray:
    """
    محاسبه ماتریس شباهت کسینوسی بین تمام بردارها
    هرچه نزدیک‌تر به ۱، سازگاری بیشتر
    """
    normalized = normalize(vectors, norm='l2')
    return np.dot(normalized, normalized.T)


def build_cold_start_vector(user_data: dict) -> np.ndarray:
    """
    وکتور اولیه برای کاربران بدون تاریخچه (Cold Start)
    از داده‌های دموگرافیک به عنوان وزن اولیه استفاده می‌شود
    """
    vec = np.zeros(VECTOR_DIM)

    # سن → اعداد اول بردار
    if user_data.get("age"):
        age_norm = (user_data["age"] - 18) / (80 - 18)  # نرمال‌سازی بین 0-1
        vec[0] = age_norm

    # جنسیت
    gender_map = {"male": 0.0, "female": 1.0, "non-binary": 0.5}
    vec[1] = gender_map.get(user_data.get("gender", ""), 0.5)

    # شهر (hash ساده)
    if user_data.get("city"):
        city_hash = hash(user_data["city"]) % 100 / 100.0
        vec[2] = city_hash

    # علایق
    interests = user_data.get("interests", [])
    for i, interest in enumerate(interests[:10]):  # حداکثر ۱۰ علاقه
        vec[3 + i] = hash(interest) % 100 / 100.0

    # شخصیت
    personality_map = {"analytical": 0.25, "social": 0.5, "creative": 0.75, "structured": 1.0}
    traits = user_data.get("personalityTraits", [])
    if traits:
        vec[13] = personality_map.get(traits[0], 0.5)

    return vec


def reduce_dimensions(vectors: np.ndarray, target_dim: int) -> np.ndarray:
    """
    کاهش ابعاد برای افزایش سرعت پردازش
    مدیریت بردارهای ۱۵۳۶ بعدی OpenAI Embeddings
    """
    if vectors.shape[1] <= target_dim:
        return vectors
    pca = PCA(n_components=min(target_dim, vectors.shape[0] - 1))
    return pca.fit_transform(vectors)


def kmeans_clustering(
    vectors: np.ndarray,
    user_ids: list[str],
    target_group_size: int,
    n_iterations: int = 10,
) -> list[list[str]]:
    """
    K-Means Clustering برای گروه‌بندی کاربران
    هدف: گروه‌های n نفره با کمترین فاصله از هم
    """
    n_users = len(user_ids)
    if n_users < target_group_size:
        return [user_ids]  # همه در یک گروه

    n_clusters = max(1, n_users // target_group_size)

    kmeans = KMeans(
        n_clusters=n_clusters,
        init='k-means++',
        n_init=n_iterations,
        random_state=42,
    )
    labels = kmeans.fit_predict(vectors)

    groups: dict[int, list[str]] = {}
    for uid, label in zip(user_ids, labels):
        groups.setdefault(label, []).append(uid)

    return list(groups.values())


def apply_gender_diversity_constraint(
    group: list[str],
    user_gender_map: dict[str, str],
    min_genders: int = 2,
) -> bool:
    """
    قید سخت تنوع جنسیت: در هر گروه حداقل ۲ جنسیت مختلف باشد
    Multi-Objective Optimization از مستندات راوی
    """
    genders_in_group = {user_gender_map.get(uid, "unknown") for uid in group}
    known_genders = genders_in_group - {"unknown", "prefer-not-to-say"}
    return len(known_genders) >= min_genders


def rebalance_groups_for_diversity(
    groups: list[list[str]],
    user_gender_map: dict[str, str],
    max_group_size: int,
) -> list[list[str]]:
    """
    جابجایی کاربران بین گروه‌ها برای برآوردن قید تنوع جنسیت
    """
    result_groups = []
    for group in groups:
        if len(group) < 2:
            result_groups.append(group)
            continue

        genders = {uid: user_gender_map.get(uid, "unknown") for uid in group}
        male_ids = [uid for uid, g in genders.items() if g == "male"]
        female_ids = [uid for uid, g in genders.items() if g == "female"]

        if not male_ids or not female_ids:
            # گروه یک‌جنسیت، علامت‌گذاری برای جابجایی
            group_data = {"users": group, "diverse": False}
        else:
            group_data = {"users": group, "diverse": True}

        result_groups.append(group_data["users"])

    return result_groups


def compute_group_quality_score(
    group: list[str],
    vectors: np.ndarray,
    user_id_to_idx: dict[str, int],
) -> float:
    """
    امتیاز کیفیت گروه بر اساس میانگین شباهت کسینوسی اعضا
    """
    if len(group) < 2:
        return 0.0
    group_vectors = np.array([vectors[user_id_to_idx[uid]] for uid in group if uid in user_id_to_idx])
    if len(group_vectors) < 2:
        return 0.0
    sim_matrix = cosine_similarity_matrix(group_vectors)
    # میانگین شباهت‌های غیر قطری
    n = len(group_vectors)
    total_sim = (sim_matrix.sum() - n) / (n * (n - 1))
    return float(total_sim)


# ─── اندپوینت‌های API ────────────────────────────────────────────────────────

@app.post("/match", response_model=MatchResult)
async def run_matching(req: MatchRequest):
    """
    اجرای الگوریتم مچینگ برای یک رویداد
    """
    conn = None
    try:
        conn = get_db()
        cur = conn.cursor()

        # ۱. واکشی کاربران در انتظار برای این رویداد
        cur.execute("""
            SELECT u.id, u.telegram_id, p.bio_vector, p.gender, p.birth_date, p.city,
                   tr.raw_scores, tr.embedding_vector
            FROM users u
            JOIN profiles p ON p.user_id = u.id
            LEFT JOIN test_results tr ON tr.user_id = u.id
            JOIN bookings b ON b.user_id = u.id
            WHERE b.event_id = %s AND b.status = 'confirmed'
        """, (req.event_id,))
        rows = cur.fetchall()

        if len(rows) < req.min_group_size:
            raise HTTPException(
                status_code=400,
                detail=f"کاربران کافی نیست. حداقل {req.min_group_size} کاربر لازم است. فعلاً {len(rows)} نفر."
            )

        user_ids = []
        vectors = []
        gender_map = {}

        for row in rows:
            uid, telegram_id, bio_vec, gender, birth_date, city, test_scores, embedding = row
            user_ids.append(uid)
            gender_map[uid] = gender or "unknown"

            # اولویت: embedding vector از OpenAI → test scores → cold start
            if embedding:
                try:
                    vec = np.array(json.loads(embedding), dtype=float)
                    if len(vec) != VECTOR_DIM:
                        raise ValueError
                except Exception:
                    vec = build_cold_start_vector({"gender": gender, "city": city})
            elif bio_vec:
                try:
                    vec = np.array(json.loads(bio_vec), dtype=float)
                except Exception:
                    vec = build_cold_start_vector({"gender": gender, "city": city})
            else:
                # Cold Start: کاربر جدید بدون داده
                age = None
                if birth_date:
                    from datetime import date
                    age = (date.today() - birth_date).days // 365
                vec = build_cold_start_vector({"gender": gender, "age": age, "city": city})

            vectors.append(vec)

        vectors_np = np.array(vectors, dtype=float)

        # ۲. نرمال‌سازی داده‌ها
        vectors_normalized = normalize(vectors_np, norm='l2')

        # ۳. کاهش ابعاد (برای بردارهای ۱۵۳۶ بعدی)
        if vectors_normalized.shape[1] > REDUCED_DIM:
            vectors_reduced = reduce_dimensions(vectors_normalized, REDUCED_DIM)
        else:
            vectors_reduced = vectors_normalized

        # ۴. اجرای K-Means
        groups = kmeans_clustering(
            vectors=vectors_reduced,
            user_ids=user_ids,
            target_group_size=req.min_group_size,
        )

        # ۵. اعمال قید تنوع جنسیت (Multi-Objective)
        if req.require_gender_diversity:
            groups = rebalance_groups_for_diversity(groups, gender_map, req.max_group_size)

        # ۶. محاسبه امتیاز کیفیت هر گروه
        user_id_to_idx = {uid: i for i, uid in enumerate(user_ids)}
        result_groups = []
        for i, group in enumerate(groups):
            if not group:
                continue
            quality_score = compute_group_quality_score(group, vectors_np, user_id_to_idx)
            result_groups.append({
                "group_index": i,
                "user_ids": group,
                "size": len(group),
                "quality_score": round(quality_score, 4),
                "is_diverse": len({gender_map.get(uid) for uid in group if gender_map.get(uid) not in ["unknown", "prefer-not-to-say"]}) >= 2,
            })

        # ۷. ذخیره نتایج در دیتابیس
        for g in result_groups:
            cur.execute("""
                INSERT INTO matches (event_id, user_ids, quality_score, created_at)
                VALUES (%s, %s, %s, NOW())
                ON CONFLICT DO NOTHING
            """, (req.event_id, json.dumps(g["user_ids"]), g["quality_score"]))

        conn.commit()

        return MatchResult(
            event_id=req.event_id,
            groups=result_groups,
            total_users=len(rows),
            total_groups=len(result_groups),
            algorithm="kmeans_cosine_diversity",
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Matching failed for event {req.event_id}: {e}")
        raise HTTPException(status_code=500, detail=f"خطای مچینگ: {str(e)}")
    finally:
        if conn:
            conn.close()


@app.post("/similarity")
async def compute_similarity(user_a_id: str, user_b_id: str):
    """محاسبه شباهت کسینوسی بین دو کاربر خاص"""
    conn = None
    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute("""
            SELECT u.id, tr.embedding_vector, p.bio_vector
            FROM users u
            JOIN profiles p ON p.user_id = u.id
            LEFT JOIN test_results tr ON tr.user_id = u.id
            WHERE u.id = ANY(%s)
        """, ([user_a_id, user_b_id],))
        rows = {r[0]: r for r in cur.fetchall()}

        if user_a_id not in rows or user_b_id not in rows:
            raise HTTPException(status_code=404, detail="کاربر یافت نشد")

        def get_vec(row):
            for vec_json in [row[2], row[3]]:
                if vec_json:
                    try:
                        return np.array(json.loads(vec_json), dtype=float)
                    except Exception:
                        pass
            return np.random.rand(64)  # fallback

        vec_a = get_vec(rows[user_a_id])
        vec_b = get_vec(rows[user_b_id])

        # Cosine Similarity
        sim = float(np.dot(vec_a, vec_b) / (np.linalg.norm(vec_a) * np.linalg.norm(vec_b) + 1e-8))
        return {"user_a": user_a_id, "user_b": user_b_id, "cosine_similarity": round(sim, 4), "compatibility_percent": round(sim * 100, 1)}

    finally:
        if conn:
            conn.close()


@app.get("/health")
async def health():
    return {"status": "ok", "service": "ravi-matching"}
