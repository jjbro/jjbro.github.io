document.addEventListener('DOMContentLoaded', function() {
    // 레이어 팝업 열기
    const btnGameRule = document.querySelector('.btn-game-rule');
    if (btnGameRule) {
        btnGameRule.addEventListener('click', function() {
            openModal('gameRuleLayer');
            // 가이드 모션 실행
            const cursor = document.querySelector('.cursor');
            const mark = document.querySelector('.mark');

            // 이미 마크가 보이는 경우 무시
            if(mark.style.visibility === 'visible') {
                return false;
            }

            setTimeout(() => {
                cursor.style.animation = 'cursorMoveToCenter 1s ease-in-out 1s forwards';
                cursor.style.visibility = 'visible';
            }, 1000);
            setTimeout(() => {
                cursor.style.animation = 'cursorClick 0.5s ease-in-out forwards';
            }, 2000);

            setTimeout(() => {
                cursor.style.visibility = 'hidden';
                mark.style.visibility = 'visible';
                mark.style.animation = 'markCheck 0.3s ease-in-out forwards';
            }, 2500);
        });
    }

    const btnGameRank = document.querySelector('.btn-game-rank');
    if (btnGameRank) {
        btnGameRank.addEventListener('click', function() {
            openModal('gameRankLayer');
        });
    }

    // 레이어 팝업 닫기
    const closeButtons = document.querySelectorAll('.layer-popup .dimm, .btn-close');
    if (closeButtons.length > 0) {
        closeButtons.forEach(function(element) {
            element.addEventListener('click', function() {
                closeModal(this.closest('.layer-popup').id);
            });
        });
    }

    // ESC 키로 팝업 닫기
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.layer-popup.show');
            if (openModal) closeModal(openModal.id);
        }
    });

    const closeRuleBtn = document.getElementById('close-rule');
    if (closeRuleBtn) {
        closeRuleBtn.addEventListener('click', function() {
            closeModal('gameRuleLayer');
        });
    }

    const closeRankBtn = document.getElementById('close-rank');
    if (closeRankBtn) {
        closeRankBtn.addEventListener('click', function() {
            closeModal('gameRankLayer');
        });
    }
});

// 모달 열기 함수
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    document.body.style.overflow = 'hidden'; // 스크롤 방지
    modal.classList.add('show');
}

// 모달 닫기 함수
function closeModal(modalId) {  
    const modal = document.getElementById(modalId);
    modal.classList.remove('show');
    document.body.style.overflow = ''; // 스크롤 복구
}

// 파티클
function createFirework() {
    const container = document.getElementById('fireworksContainer');
    const firework = document.createElement('div');
    firework.className = 'firework';
    
    // 랜덤 위치 설정
    const x = Math.random() * (Math.min(window.innerWidth, 480) - 20);
    const y = Math.random() * 180;
    firework.style.left = x + 'px';
    firework.style.top = y + 'px';

    // 4개의 파티클 생성
    const particles = [];
    for (let i = 0; i < 4; i++) {
        const particle = document.createElement('div');
        particle.className = 'firework-particle';
        firework.appendChild(particle);
        particles.push(particle);
    }

    container.appendChild(firework);

    // 파티클 애니메이션
    setTimeout(() => {
        // 위쪽 파티클
        particles[0].style.transform = 'translate(0, -3px)';
        particles[0].style.height = '4px';
        particles[0].style.width = '2px';
        
        // 아래쪽 파티클
        particles[1].style.transform = 'translate(0, 1px)';
        particles[1].style.height = '4px';
        particles[1].style.width = '2px';
        
        // 왼쪽 파티클
        particles[2].style.transform = 'translate(-3px, 0)';
        particles[2].style.width = '4px';
        particles[2].style.height = '2px';
        
        // 오른쪽 파티클
        particles[3].style.transform = 'translate(1px, 0)';
        particles[3].style.width = '4px';
        particles[3].style.height = '2px';

        particles.forEach(p => p.style.opacity = '0.8');
    }, 100);

    // 페이드 아웃
    setTimeout(() => {
        particles[0].style.transform = 'translate(0, -5px)';
        particles[1].style.transform = 'translate(0, 3px)';
        particles[2].style.transform = 'translate(-5px, 0)';
        particles[3].style.transform = 'translate(3px, 0)';
        particles.forEach(p => {
            p.style.opacity = '0';
        });
    }, 600);

    // 요소 제거
    setTimeout(() => {
        container.removeChild(firework);
    }, 1000);
}

// 주기적으로 파티클 생성
function startFireworks() {
    const createRandomFirework = () => {
        if (document.getElementById('fireworksContainer').children.length < 8) {
            createFirework();
        }
        setTimeout(createRandomFirework, Math.random() * 300);
    };
    createRandomFirework();
}