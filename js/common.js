document.addEventListener('DOMContentLoaded', function() {
    // 레이어 팝업 열기
    document.querySelector('.btn-game-rule').addEventListener('click', function() {
        openModal('gameRuleLayer');
    });

    document.querySelector('.btn-game-rank').addEventListener('click', function() {
        openModal('gameRankLayer');
    });

    // 레이어 팝업 닫기
    document.querySelectorAll('.layer-popup .dimm, .btn-close').forEach(function(element) {
        element.addEventListener('click', function() {
            closeModal(this.closest('.layer-popup').id);
        });
    });

    // ESC 키로 팝업 닫기
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.layer-popup.show');
            if (openModal) closeModal(openModal.id);
        }
    });
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