import React from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext'; // 👈 전역 설정 창고 불러오기
import "../components/Header.css";

export default function Header() {
  // 전역 창고에서 실시간으로 닉네임과 프로필 이미지 주소 가져오기
  const { profileName, profileImage } = useSettings();

  return (
    <div>
      <header>
        <div className='TopBox'>
          {/* 왼쪽: 로고 영역 */}
          <div className='homeWithMyGall'>
            <div className='Home1'>
              <Link to="/" className='Home2'>
                <div className='Home3'>
                  <img className='Logo' src='/img/hearing.svg' alt='Logo' />
                </div>
              </Link>
            </div>
          </div>

          {/* 오른쪽: 프로필 로고 및 닉네임 영역 */}
          <div className='RightBar'>
            <Link to="/Setting" className='My1' style={{ textDecoration: 'none' }}>
              <div className='My2' style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                
                {/* 닉네임 표시 (실시간 연동) */}
                {/* <span className='HeaderName' style={{ fontSize: '14px', fontWeight: '600', color: '#555555' }}>
                  {profileName}님
                </span> */}

                {/* 프로필 이미지 표시 (실시간 연동) */}
                {profileImage ? (
                  // 등록한 커스텀 이미지가 있으면 둥글게 원형 처리하여 표시
                  <img 
                    className='My3' 
                    src={profileImage} 
                    alt='Account' 
                    style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} 
                  />
                ) : (
                  // 등록한 이미지가 없으면 기본 회색 아바타 아이콘 표시
                  <img 
                    className='My3' 
                    src='../img/account_circle.svg' 
                    alt='Account' 
                    style={{ width: '32px', height: '32px' }} 
                  />
                )}
                
              </div>
            </Link>
          </div>
        </div>
      </header>
    </div>
  );
}