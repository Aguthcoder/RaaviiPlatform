'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface Question {
  id: number;
  text: string;
  icon: string;
  options: {
    id: string;
    text: string;
    icon: string;
    type: 'thinking' | 'feeling';
  }[];
}

const questions: Question[] = [
  {
    id: 1,
    text: 'تو تصمیم‌هات، کومیتر راهمایته؟ جلو میرم؟',
    icon: '/test-icon.png',
    options: [
      {
        id: 'q1_thinking',
        text: 'بیشتر با فکر و تحلیل جلو میرم',
        icon: '🧠',
        type: 'thinking'
      },
      {
        id: 'q1_feeling',
        text: 'بیشتر با احساس و حال جلو میرم رنگیرم',
        icon: '❤️',
        type: 'feeling'
      }
    ]
  },
  {
    id: 2,
    text: 'وقتی می‌خوای یه کار مهم انجام بدی، چطور شروع می‌کنی؟',
    icon: '/test-icon.png',
    options: [
      {
        id: 'q2_thinking',
        text: 'اول برنامه‌ریزی می‌کنم و همه چیز رو مرتب می‌کنم',
        icon: '📋',
        type: 'thinking'
      },
      {
        id: 'q2_feeling',
        text: 'با انگیزه و انرژی شروع می‌کنم و در مسیر یاد می‌گیرم',
        icon: '⚡',
        type: 'feeling'
      }
    ]
  },
  {
    id: 3,
    text: 'در گروه‌ها معمولاً چه نقشی داری؟',
    icon: '/test-icon.png',
    options: [
      {
        id: 'q3_thinking',
        text: 'رهبری و هماهنگی کارها رو بر عهده می‌گیرم',
        icon: '👔',
        type: 'thinking'
      },
      {
        id: 'q3_feeling',
        text: 'انگیزه و انرژی مثبت به گروه می‌دم',
        icon: '✨',
        type: 'feeling'
      }
    ]
  },
  {
    id: 4,
    text: 'وقتی با یه مشکل مواجه می‌شی، چه واکنشی نشون می‌دی؟',
    icon: '/test-icon.png',
    options: [
      {
        id: 'q4_thinking',
        text: 'آروم می‌شینم و راه حل منطقی پیدا می‌کنم',
        icon: '🤔',
        type: 'thinking'
      },
      {
        id: 'q4_feeling',
        text: 'با دیگران صحبت می‌کنم و از حس و تجربه‌شون استفاده می‌کنم',
        icon: '💬',
        type: 'feeling'
      }
    ]
  },
  {
    id: 5,
    text: 'در تصمیم‌گیری‌های مهم، بیشتر به چی اهمیت می‌دی؟',
    icon: '/test-icon.png',
    options: [
      {
        id: 'q5_thinking',
        text: 'منطق و تحلیل دقیق موضوع',
        icon: '📊',
        type: 'thinking'
      },
      {
        id: 'q5_feeling',
        text: 'احساس درونی و حس شهودی',
        icon: '💫',
        type: 'feeling'
      }
    ]
  }
];

export default function PersonalityTest() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (questionId: number, answerType: 'thinking' | 'feeling') => {
    setAnswers(prev => ({ ...prev, [questionId]: answerType }));
    
    if (currentQuestion < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
      }, 300);
    } else {
      setTimeout(() => {
        setShowResult(true);
      }, 300);
    }
  };

  const calculateResult = () => {
    const thinkingCount = Object.values(answers).filter(a => a === 'thinking').length;
    const feelingCount = Object.values(answers).filter(a => a === 'feeling').length;
    
    if (thinkingCount > feelingCount) {
      return {
        type: 'تحلیلگر منطقی',
        description: 'شما فردی منطقی و تحلیل‌گر هستید که تصمیمات خود را با دقت و فکر می‌گیرید. برنامه‌ریزی و نظم برای شما اهمیت دارد.',
        icon: '🧠'
      };
    } else if (feelingCount > thinkingCount) {
      return {
        type: 'احساسی و شهودی',
        description: 'شما فردی احساسی و شهودی هستید که از قلب و حس درونی خود پیروی می‌کنید. انرژی مثبت و ارتباطات عمیق برای شما مهم است.',
        icon: '❤️'
      };
    } else {
      return {
        type: 'متعادل',
        description: 'شما تعادل خوبی بین منطق و احساس دارید و بسته به موقعیت، از هر دو استفاده می‌کنید.',
        icon: '⚖️'
      };
    }
  };

  if (showResult) {
    const result = calculateResult();
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
          <div className="text-6xl mb-4">{result.icon}</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">{result.type}</h2>
          <p className="text-lg text-gray-600 mb-8">{result.description}</p>
          <button
            onClick={() => {
              setAnswers({});
              setCurrentQuestion(0);
              setShowResult(false);
            }}
            className="bg-orange-500 text-white px-8 py-3 rounded-full font-bold hover:bg-orange-600 transition-colors"
          >
            تست مجدد
          </button>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">
              سوال {currentQuestion + 1} از {questions.length}
            </span>
            <span className="text-sm text-gray-600">
              {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-orange-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="flex items-center justify-center mb-6">
            <Image
              src={question.icon}
              alt="Question Icon"
              width={48}
              height={48}
              className="ml-4"
            />
            <h2 className="text-2xl font-bold text-gray-800 text-center">
              {question.text}
            </h2>
          </div>

          <div className="space-y-4 mt-8">
            {question.options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleAnswer(question.id, option.type)}
                className={`w-full p-6 rounded-2xl border-2 text-right transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                  option.type === 'thinking'
                    ? 'border-orange-200 bg-orange-50 hover:border-orange-500 hover:bg-orange-100'
                    : 'border-orange-400 bg-orange-500 text-white hover:bg-orange-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl ml-4">{option.icon}</span>
                  <span className={`text-lg font-medium ${option.type === 'feeling' ? 'text-white' : 'text-gray-800'}`}>
                    {option.text}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
