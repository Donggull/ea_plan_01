'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DocumentTextIcon,
  CodeBracketIcon,
  RocketLaunchIcon,
  SparklesIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  StarIcon,
  TagIcon,
  ClockIcon,
  UserIcon,
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolid } from '@heroicons/react/24/solid'

export interface CodeTemplate {
  id: string
  name: string
  description: string
  language: string
  category: 'starter' | 'snippet' | 'project' | 'ai-generated'
  tags: string[]
  code: string
  author?: string
  createdAt?: string
  isFavorite?: boolean
  usageCount?: number
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
}

interface CodeTemplatesProps {
  language: string
  onSelectTemplate: (template: CodeTemplate) => void
  onClose: () => void
  isOpen: boolean
}

// 내장 코드 템플릿 데이터
const BUILT_IN_TEMPLATES: CodeTemplate[] = [
  // JavaScript 템플릿
  {
    id: 'js-hello-world',
    name: 'Hello World',
    description: '기본적인 Hello World 예제',
    language: 'javascript',
    category: 'starter',
    tags: ['기초', '시작'],
    difficulty: 'beginner',
    code: `// Hello World 예제
console.log('Hello, World! 🌟');

function greet(name) {
  return \`안녕하세요, \${name}님!\`;
}

console.log(greet('개발자'));`,
    author: 'AI Assistant',
    createdAt: '2024-01-01',
    usageCount: 1250,
  },
  {
    id: 'js-async-await',
    name: 'Async/Await 패턴',
    description: '비동기 처리를 위한 async/await 예제',
    language: 'javascript',
    category: 'snippet',
    tags: ['비동기', 'Promise', 'API'],
    difficulty: 'intermediate',
    code: `// Async/Await 비동기 처리 예제
async function fetchUserData(userId) {
  try {
    console.log('사용자 데이터를 가져오는 중...');
    
    // API 호출 시뮬레이션
    const response = await fetch(\`https://jsonplaceholder.typicode.com/users/\${userId}\`);
    const userData = await response.json();
    
    console.log('✅ 사용자 데이터:', userData);
    return userData;
  } catch (error) {
    console.error('❌ 에러 발생:', error.message);
    throw error;
  }
}

// 사용 예시
(async () => {
  try {
    const user = await fetchUserData(1);
    console.log(\`사용자 이름: \${user.name}\`);
  } catch (error) {
    console.log('데이터 가져오기 실패');
  }
})();`,
    author: 'AI Assistant',
    createdAt: '2024-01-02',
    usageCount: 890,
  },
  {
    id: 'js-dom-manipulation',
    name: 'DOM 조작',
    description: 'DOM 요소 조작 및 이벤트 처리',
    language: 'javascript',
    category: 'snippet',
    tags: ['DOM', '이벤트', 'UI'],
    difficulty: 'intermediate',
    code: `// DOM 조작 및 이벤트 처리 예제
document.addEventListener('DOMContentLoaded', () => {
  // 버튼 생성
  const button = document.createElement('button');
  button.textContent = '클릭하세요! 🚀';
  button.className = 'magic-button';
  
  // 카운터 표시 요소
  const counter = document.createElement('div');
  counter.textContent = '클릭 횟수: 0';
  counter.className = 'counter';
  
  let clickCount = 0;
  
  // 클릭 이벤트 핸들러
  button.addEventListener('click', (e) => {
    clickCount++;
    counter.textContent = \`클릭 횟수: \${clickCount}\`;
    
    // 버튼 애니메이션 효과
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
      button.style.transform = 'scale(1)';
    }, 100);
    
    // 배경색 변경
    document.body.style.backgroundColor = \`hsl(\${clickCount * 30 % 360}, 70%, 90%)\`;
  });
  
  // 요소들을 DOM에 추가
  document.body.appendChild(button);
  document.body.appendChild(counter);
  
  console.log('DOM 조작 예제가 준비되었습니다! 🎉');
});`,
    author: 'AI Assistant',
    createdAt: '2024-01-03',
    usageCount: 567,
  },
  // TypeScript 템플릿
  {
    id: 'ts-interface-class',
    name: 'Interface & Class',
    description: 'TypeScript 인터페이스와 클래스 예제',
    language: 'typescript',
    category: 'starter',
    tags: ['Interface', 'Class', '타입'],
    difficulty: 'intermediate',
    code: `// TypeScript Interface & Class 예제
interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  createdAt: Date;
}

interface UserService {
  getUser(id: number): Promise<User | null>;
  createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
}

class ApiUserService implements UserService {
  private baseUrl: string;
  
  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }
  
  async getUser(id: number): Promise<User | null> {
    try {
      const response = await fetch(\`\${this.baseUrl}/users/\${id}\`);
      if (!response.ok) return null;
      
      const userData = await response.json();
      return {
        ...userData,
        createdAt: new Date(userData.createdAt)
      };
    } catch (error) {
      console.error('사용자 조회 실패:', error);
      return null;
    }
  }
  
  async createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const newUser: User = {
      ...userData,
      id: Math.floor(Math.random() * 10000),
      createdAt: new Date()
    };
    
    console.log('새 사용자 생성:', newUser);
    return newUser;
  }
  
  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const existingUser = await this.getUser(id);
    if (!existingUser) {
      throw new Error('사용자를 찾을 수 없습니다');
    }
    
    const updatedUser: User = {
      ...existingUser,
      ...updates
    };
    
    console.log('사용자 업데이트:', updatedUser);
    return updatedUser;
  }
}

// 사용 예시
const userService = new ApiUserService();

(async () => {
  try {
    const newUser = await userService.createUser({
      name: '김개발',
      email: 'kim@example.com',
      role: 'user'
    });
    
    console.log('✅ 사용자 생성 완료:', newUser);
  } catch (error) {
    console.error('❌ 오류:', error);
  }
})();`,
    author: 'AI Assistant',
    createdAt: '2024-01-04',
    usageCount: 723,
  },
  // Python 템플릿
  {
    id: 'py-data-analysis',
    name: '데이터 분석 기초',
    description: 'Python으로 기본적인 데이터 분석',
    language: 'python',
    category: 'starter',
    tags: ['데이터', '분석', '통계'],
    difficulty: 'intermediate',
    code: `# Python 데이터 분석 기초 예제
import statistics
from datetime import datetime, timedelta
import json

# 샘플 데이터 생성
def generate_sample_data():
    """샘플 데이터를 생성하는 함수"""
    data = {
        'users': [
            {'id': 1, 'name': '김철수', 'age': 25, 'score': 85},
            {'id': 2, 'name': '이영희', 'age': 30, 'score': 92},
            {'id': 3, 'name': '박민수', 'age': 28, 'score': 78},
            {'id': 4, 'name': '최지우', 'age': 22, 'score': 96},
            {'id': 5, 'name': '정수연', 'age': 35, 'score': 88}
        ],
        'sales': [100, 150, 200, 180, 220, 190, 250]
    }
    return data

def analyze_user_data(users):
    """사용자 데이터 분석"""
    ages = [user['age'] for user in users]
    scores = [user['score'] for user in users]
    
    print("👥 사용자 데이터 분석 결과")
    print("=" * 30)
    print(f"총 사용자 수: {len(users)}")
    print(f"평균 나이: {statistics.mean(ages):.1f}세")
    print(f"나이 범위: {min(ages)}세 ~ {max(ages)}세")
    print(f"평균 점수: {statistics.mean(scores):.1f}점")
    print(f"최고 점수: {max(scores)}점")
    print(f"점수 표준편차: {statistics.stdev(scores):.2f}")
    
    # 최고 점수 사용자 찾기
    top_user = max(users, key=lambda x: x['score'])
    print(f"🏆 최고 점수자: {top_user['name']} ({top_user['score']}점)")

def analyze_sales_data(sales):
    """매출 데이터 분석"""
    print("\\n📊 매출 데이터 분석 결과")
    print("=" * 30)
    print(f"총 매출: {sum(sales):,}원")
    print(f"평균 매출: {statistics.mean(sales):,.0f}원")
    print(f"매출 증가율: {((sales[-1] - sales[0]) / sales[0] * 100):+.1f}%")
    
    # 트렌드 분석
    increasing_days = sum(1 for i in range(1, len(sales)) if sales[i] > sales[i-1])
    print(f"📈 상승 일수: {increasing_days}/{len(sales)-1}일")

def main():
    """메인 실행 함수"""
    print("🚀 Python 데이터 분석 시작!")
    print("=" * 40)
    
    # 데이터 로드
    data = generate_sample_data()
    
    # 분석 수행
    analyze_user_data(data['users'])
    analyze_sales_data(data['sales'])
    
    print("\\n✅ 분석 완료!")

# 프로그램 실행
if __name__ == "__main__":
    main()`,
    author: 'AI Assistant',
    createdAt: '2024-01-05',
    usageCount: 445,
  },
  // HTML 템플릿
  {
    id: 'html-landing-page',
    name: '랜딩 페이지',
    description: '모던한 랜딩 페이지 템플릿',
    language: 'html',
    category: 'project',
    tags: ['웹사이트', '랜딩', 'UI'],
    difficulty: 'intermediate',
    code: `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🚀 AI 코드 캔버스 - 랜딩 페이지</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }
        
        /* 헤더 */
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 1rem 0;
            position: sticky;
            top: 0;
            z-index: 100;
        }
        
        .nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .logo {
            font-size: 1.5rem;
            font-weight: bold;
        }
        
        .nav-links {
            display: flex;
            list-style: none;
            gap: 2rem;
        }
        
        .nav-links a {
            color: white;
            text-decoration: none;
            transition: opacity 0.3s;
        }
        
        .nav-links a:hover {
            opacity: 0.8;
        }
        
        /* 히어로 섹션 */
        .hero {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 6rem 0;
            text-align: center;
        }
        
        .hero h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
            animation: fadeInUp 1s ease-out;
        }
        
        .hero p {
            font-size: 1.2rem;
            margin-bottom: 2rem;
            opacity: 0.9;
            animation: fadeInUp 1s ease-out 0.2s both;
        }
        
        .cta-button {
            display: inline-block;
            background: white;
            color: #667eea;
            padding: 1rem 2rem;
            border-radius: 50px;
            text-decoration: none;
            font-weight: bold;
            transition: transform 0.3s, box-shadow 0.3s;
            animation: fadeInUp 1s ease-out 0.4s both;
        }
        
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        
        /* 기능 섹션 */
        .features {
            padding: 6rem 0;
            background: #f8f9fa;
        }
        
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-top: 3rem;
        }
        
        .feature-card {
            background: white;
            padding: 2rem;
            border-radius: 15px;
            text-align: center;
            box-shadow: 0 5px 20px rgba(0,0,0,0.1);
            transition: transform 0.3s;
        }
        
        .feature-card:hover {
            transform: translateY(-5px);
        }
        
        .feature-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
        }
        
        .feature-card h3 {
            margin-bottom: 1rem;
            color: #667eea;
        }
        
        /* 푸터 */
        .footer {
            background: #333;
            color: white;
            text-align: center;
            padding: 3rem 0;
        }
        
        /* 애니메이션 */
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        /* 반응형 */
        @media (max-width: 768px) {
            .nav-links {
                display: none;
            }
            
            .hero h1 {
                font-size: 2rem;
            }
            
            .features-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <!-- 헤더 -->
    <header class="header">
        <nav class="nav container">
            <div class="logo">🚀 AI 코드 캔버스</div>
            <ul class="nav-links">
                <li><a href="#features">기능</a></li>
                <li><a href="#about">소개</a></li>
                <li><a href="#contact">문의</a></li>
            </ul>
        </nav>
    </header>

    <!-- 히어로 섹션 -->
    <section class="hero">
        <div class="container">
            <h1>AI와 함께하는 코드 캔버스</h1>
            <p>Monaco Editor로 VS Code와 같은 강력한 편집 환경을 경험하세요</p>
            <a href="#features" class="cta-button">지금 시작하기 ✨</a>
        </div>
    </section>

    <!-- 기능 섹션 -->
    <section id="features" class="features">
        <div class="container">
            <h2 style="text-align: center; font-size: 2.5rem; margin-bottom: 1rem;">
                강력한 기능들
            </h2>
            <p style="text-align: center; color: #666; font-size: 1.1rem;">
                전문적인 개발 도구를 브라우저에서 바로 사용하세요
            </p>
            
            <div class="features-grid">
                <div class="feature-card">
                    <div class="feature-icon">⚡</div>
                    <h3>실시간 코드 편집</h3>
                    <p>Monaco Editor로 VS Code와 동일한 편집 경험을 제공합니다. 문법 하이라이팅, 자동완성, 에러 체크까지!</p>
                </div>
                
                <div class="feature-card">
                    <div class="feature-icon">🎨</div>
                    <h3>다양한 언어 지원</h3>
                    <p>JavaScript, TypeScript, Python, HTML/CSS, React 등 다양한 프로그래밍 언어를 지원합니다.</p>
                </div>
                
                <div class="feature-card">
                    <div class="feature-icon">🚀</div>
                    <h3>즉시 실행</h3>
                    <p>작성한 코드를 바로 실행하고 결과를 확인할 수 있습니다. Ctrl+Enter로 간편하게!</p>
                </div>
                
                <div class="feature-card">
                    <div class="feature-icon">🌙</div>
                    <h3>테마 지원</h3>
                    <p>라이트 모드와 다크 모드를 지원하여 편안한 코딩 환경을 제공합니다.</p>
                </div>
                
                <div class="feature-card">
                    <div class="feature-icon">📱</div>
                    <h3>반응형 디자인</h3>
                    <p>데스크톱부터 모바일까지, 어떤 기기에서도 최적화된 환경으로 코딩할 수 있습니다.</p>
                </div>
                
                <div class="feature-card">
                    <div class="feature-icon">💾</div>
                    <h3>자동 저장</h3>
                    <p>작업 내용이 자동으로 저장되어 소중한 코드를 잃어버릴 걱정이 없습니다.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- 푸터 -->
    <footer class="footer">
        <div class="container">
            <h3>🚀 AI 코드 캔버스</h3>
            <p>코딩의 새로운 경험을 시작하세요</p>
            <p style="margin-top: 2rem; opacity: 0.7;">
                © 2024 AI Code Canvas. Made with ❤️ by AI Assistant
            </p>
        </div>
    </footer>

    <script>
        // 부드러운 스크롤 효과
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                document.querySelector(this.getAttribute('href')).scrollIntoView({
                    behavior: 'smooth'
                });
            });
        });
        
        // 스크롤 애니메이션
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animationDelay = '0s';
                    entry.target.style.animationFillMode = 'both';
                    entry.target.style.animationName = 'fadeInUp';
                    entry.target.style.animationDuration = '0.6s';
                }
            });
        }, observerOptions);
        
        document.querySelectorAll('.feature-card').forEach(card => {
            observer.observe(card);
        });
        
        console.log('🚀 AI 코드 캔버스 랜딩 페이지가 로드되었습니다!');
    </script>
</body>
</html>`,
    author: 'AI Assistant',
    createdAt: '2024-01-06',
    usageCount: 234,
  },
  // React JSX 템플릿
  {
    id: 'jsx-todo-app',
    name: 'Todo 앱',
    description: 'React hooks를 사용한 할일 관리 앱',
    language: 'jsx',
    category: 'project',
    tags: ['React', 'Hooks', 'State'],
    difficulty: 'intermediate',
    code: `// React Todo 앱 예제
import React, { useState, useEffect, useCallback } from 'react';

function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'completed'
  
  // 로컬 스토리지에서 데이터 로드
  useEffect(() => {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos));
    }
  }, []);
  
  // 데이터 저장
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);
  
  // 할일 추가
  const addTodo = useCallback((text) => {
    if (!text.trim()) return;
    
    const newTodo = {
      id: Date.now(),
      text: text.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    };
    
    setTodos(prev => [...prev, newTodo]);
    setInputValue('');
  }, []);
  
  // 할일 토글
  const toggleTodo = useCallback((id) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  }, []);
  
  // 할일 삭제
  const deleteTodo = useCallback((id) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  }, []);
  
  // 완료된 할일 모두 삭제
  const clearCompleted = useCallback(() => {
    setTodos(prev => prev.filter(todo => !todo.completed));
  }, []);
  
  // 필터링된 할일 목록
  const filteredTodos = todos.filter(todo => {
    switch (filter) {
      case 'active': return !todo.completed;
      case 'completed': return todo.completed;
      default: return true;
    }
  });
  
  const activeCount = todos.filter(todo => !todo.completed).length;
  const completedCount = todos.filter(todo => todo.completed).length;
  
  return (
    <div style={{
      maxWidth: '600px',
      margin: '40px auto',
      padding: '20px',
      fontFamily: 'Segoe UI, sans-serif'
    }}>
      <h1 style={{
        textAlign: 'center',
        color: '#333',
        marginBottom: '30px'
      }}>
        📝 Todo 앱
      </h1>
      
      {/* 입력 폼 */}
      <div style={{
        display: 'flex',
        marginBottom: '30px',
        gap: '10px'
      }}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo(inputValue)}
          placeholder="새로운 할일을 입력하세요..."
          style={{
            flex: 1,
            padding: '15px',
            border: '2px solid #e0e0e0',
            borderRadius: '10px',
            fontSize: '16px',
            outline: 'none'
          }}
        />
        <button
          onClick={() => addTodo(inputValue)}
          style={{
            padding: '15px 25px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600'
          }}
        >
          추가 ➕
        </button>
      </div>
      
      {/* 필터 버튼 */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '10px',
        marginBottom: '20px'
      }}>
        {['all', 'active', 'completed'].map(filterType => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType)}
            style={{
              padding: '8px 16px',
              border: '1px solid #ddd',
              borderRadius: '20px',
              background: filter === filterType ? '#667eea' : 'white',
              color: filter === filterType ? 'white' : '#666',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {filterType === 'all' ? '전체' : 
             filterType === 'active' ? '진행중' : '완료'}
          </button>
        ))}
      </div>
      
      {/* 통계 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px',
        background: '#f8f9fa',
        borderRadius: '10px',
        marginBottom: '20px'
      }}>
        <span>📊 전체: {todos.length}</span>
        <span>⚡ 진행중: {activeCount}</span>
        <span>✅ 완료: {completedCount}</span>
        {completedCount > 0 && (
          <button
            onClick={clearCompleted}
            style={{
              padding: '5px 10px',
              background: '#ff6b6b',
              color: 'white',
              border: 'none',
              borderRadius: '15px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            완료된 항목 삭제 🗑️
          </button>
        )}
      </div>
      
      {/* 할일 목록 */}
      <div style={{ marginTop: '20px' }}>
        {filteredTodos.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#999',
            fontSize: '16px'
          }}>
            {filter === 'active' ? '진행중인 할일이 없습니다 🎉' :
             filter === 'completed' ? '완료된 할일이 없습니다 📝' :
             '할일을 추가해보세요! ✨'}
          </div>
        ) : (
          filteredTodos.map(todo => (
            <div
              key={todo.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '15px',
                background: 'white',
                borderRadius: '10px',
                marginBottom: '10px',
                border: '1px solid #e0e0e0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
              }}
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
                style={{
                  marginRight: '15px',
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer'
                }}
              />
              <span
                style={{
                  flex: 1,
                  fontSize: '16px',
                  textDecoration: todo.completed ? 'line-through' : 'none',
                  color: todo.completed ? '#999' : '#333',
                  opacity: todo.completed ? 0.7 : 1
                }}
              >
                {todo.text}
              </span>
              <span
                style={{
                  fontSize: '12px',
                  color: '#999',
                  marginRight: '15px'
                }}
              >
                {new Date(todo.createdAt).toLocaleDateString('ko-KR')}
              </span>
              <button
                onClick={() => deleteTodo(todo.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  padding: '5px'
                }}
              >
                ❌
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default TodoApp;`,
    author: 'AI Assistant',
    createdAt: '2024-01-07',
    usageCount: 156,
  },
]

const CATEGORY_ICONS = {
  starter: RocketLaunchIcon,
  snippet: CodeBracketIcon,
  project: DocumentTextIcon,
  'ai-generated': SparklesIcon,
}

const CATEGORY_LABELS = {
  starter: '시작 템플릿',
  snippet: '코드 스니펫',
  project: '프로젝트',
  'ai-generated': 'AI 생성',
}

const DIFFICULTY_COLORS = {
  beginner: 'text-green-600 bg-green-100',
  intermediate: 'text-yellow-600 bg-yellow-100',
  advanced: 'text-red-600 bg-red-100',
}

const DIFFICULTY_LABELS = {
  beginner: '초급',
  intermediate: '중급',
  advanced: '고급',
}

export default function CodeTemplates({
  language,
  onSelectTemplate,
  onClose,
  isOpen,
}: CodeTemplatesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [favorites, setFavorites] = useState<string[]>([])

  // 언어별 템플릿 필터링
  const languageTemplates = BUILT_IN_TEMPLATES.filter(
    template =>
      template.language === language ||
      (template.language === 'jsx' && language === 'javascript')
  )

  // 카테고리 및 검색으로 필터링
  const filteredTemplates = languageTemplates.filter(template => {
    const matchesCategory =
      selectedCategory === 'all' || template.category === selectedCategory
    const matchesSearch =
      !searchQuery ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some(tag =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      )

    return matchesCategory && matchesSearch
  })

  // 즐겨찾기 토글
  const toggleFavorite = (templateId: string) => {
    setFavorites(prev =>
      prev.includes(templateId)
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    )
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl"
        >
          {/* 헤더 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <DocumentTextIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  코드 템플릿
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {language.toUpperCase()} 언어용 템플릿 (
                  {languageTemplates.length}개)
                </p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </motion.button>
          </div>

          {/* 검색 및 필터 */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* 검색 */}
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="템플릿 검색..."
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>

              {/* 카테고리 필터 */}
              <div className="flex space-x-2 overflow-x-auto">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  전체 ({languageTemplates.length})
                </button>
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
                  const count = languageTemplates.filter(
                    t => t.category === key
                  ).length
                  if (count === 0) return null

                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedCategory(key)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                        selectedCategory === key
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {label} ({count})
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* 템플릿 목록 */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-300px)]">
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DocumentTextIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  템플릿을 찾을 수 없습니다
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  다른 카테고리를 선택하거나 검색어를 변경해보세요.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template, index) => {
                  const CategoryIcon = CATEGORY_ICONS[template.category]
                  const isFavorite = favorites.includes(template.id)

                  return (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white dark:bg-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-200 cursor-pointer group"
                      onClick={() => onSelectTemplate(template)}
                    >
                      {/* 템플릿 헤더 */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <CategoryIcon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {template.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {CATEGORY_LABELS[template.category]}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={e => {
                            e.stopPropagation()
                            toggleFavorite(template.id)
                          }}
                          className="p-1 text-gray-400 hover:text-yellow-500 transition-colors"
                        >
                          {isFavorite ? (
                            <StarSolid className="w-5 h-5 text-yellow-500" />
                          ) : (
                            <StarIcon className="w-5 h-5" />
                          )}
                        </button>
                      </div>

                      {/* 설명 */}
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                        {template.description}
                      </p>

                      {/* 태그 */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {template.tags.slice(0, 3).map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                        {template.tags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                            +{template.tags.length - 3}
                          </span>
                        )}
                      </div>

                      {/* 메타 정보 */}
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-4">
                          {template.difficulty && (
                            <span
                              className={`px-2 py-1 rounded-full ${DIFFICULTY_COLORS[template.difficulty]}`}
                            >
                              {DIFFICULTY_LABELS[template.difficulty]}
                            </span>
                          )}
                          {template.usageCount && (
                            <div className="flex items-center space-x-1">
                              <ClipboardDocumentIcon className="w-3 h-3" />
                              <span>
                                {template.usageCount.toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>

                        {template.author && (
                          <div className="flex items-center space-x-1">
                            <UserIcon className="w-3 h-3" />
                            <span>{template.author}</span>
                          </div>
                        )}
                      </div>

                      {/* 사용 버튼 */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={e => {
                          e.stopPropagation()
                          onSelectTemplate(template)
                        }}
                        className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200"
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <CheckIcon className="w-4 h-4" />
                          <span>사용하기</span>
                        </div>
                      </motion.button>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
