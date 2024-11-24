document.addEventListener('DOMContentLoaded', () => {
    // 기본 요소 선택
    const container = document.querySelector('.game-container');
    const background = document.querySelector('.background');
    const zoomButtons = document.querySelectorAll('.zoom-btn');
    const minimapViewport = document.querySelector('.minimap-viewport');

    let currentScale = 1;
    let currentX = 0;
    let currentY = 0;
    
    // 줌 레벨 관련 변수
    const zoomLevels = [1, 1.3, 1.5, 2];
    let currentZoomIndex = 0;

    let isDragging = false;
    let startX, startY;
    let startPanX, startPanY;

    // 핀치 줌 관련 변수
    let initialDistance = 0;
    let initialScale = 1;

    // 초기 커서 스타일 설정
    background.style.cursor = 'grab';
    
    // 파노라마 관련 변수 추가
    let isPanoramaPlaying = false;
    const panoramaDuration = 3000; // 이동 시간
    const panoramaDistance = -1000; // 이동 거리

    // 타이머 관련 변수 추가
    const timerElement = document.querySelector('.timer');
    let startTime;
    let timerInterval;
    
    // 스크롤 이벤트 리스너
    container.addEventListener('scroll', updateMinimapViewport);

    // 타겟 클릭 이벤트 리스너
    document.querySelectorAll('.target').forEach(target => {
        target.addEventListener('click', function(e) {
            // 파노라마가 진행 중이면 클릭 무시
            if (isPanoramaPlaying) {
                e.preventDefault();
                return;
            }
            
            const targetClass = this.classList[1];
            const targetSlide = document.querySelector(`.swiper-slide[data-target="${targetClass}"]`);
            if (targetSlide) {
                targetSlide.classList.add('found');
            }
        });
    });

    // 줌 인 버튼
    document.getElementById('zoomIn').addEventListener('click', () => {
        if (currentZoomIndex < zoomLevels.length - 1) {
            currentZoomIndex++;
            updateZoom(zoomLevels[currentZoomIndex]);
        }
    });
    // 줌 아웃 버튼
    document.getElementById('zoomOut').addEventListener('click', () => {
        if (currentZoomIndex > 0) {
            currentZoomIndex--;
            updateZoom(zoomLevels[currentZoomIndex]);
        }
    });
    
    // 마우스 이벤트 리스너 추가
    background.addEventListener('mousedown', startDragging);
    window.addEventListener('mousemove', drag);
    window.addEventListener('mouseup', stopDragging);

    // 터치 이벤트 리스너 추가
    background.addEventListener('touchstart', startDragging, { passive: false });
    window.addEventListener('touchmove', drag, { passive: false });
    window.addEventListener('touchend', stopDragging, { passive: false });

    // 클릭 이벤트 핸들러 수정
    background.addEventListener('click', function(e) {
        // 파노라마가 진행 중이면 클릭 무시
        if (isPanoramaPlaying) {
            e.preventDefault();
            return;
        }
        
        const target = e.target.closest('.target');
        const targetInfo = document.querySelector('.target-info');
        const targetImg = targetInfo.querySelector('.bg-img');
        const targetName = targetInfo.querySelector('.name');
        const targetCountry = targetInfo.querySelector('.country');
        const targetDesc = targetInfo.querySelector('.desc');
        
        if (target) {
            // 이미 찾은 타겟인 경우 무시
            if (target.classList.contains('found')) {
                return;
            }
            
            // target-info 업데이트
            targetName.textContent = target.dataset.text;
            targetCountry.textContent = target.dataset.country;
            targetDesc.textContent = target.dataset.desc;
            targetImg.className = 'bg-img';
            targetImg.classList.add(target.dataset.target);
            targetInfo.style.visibility = 'visible';
            
            // 숨은 그림을 찾은 경우의 나머지 로직
            const targetClass = target.classList[1];
            const targetSlide = document.querySelector(`.swiper-slide[data-target="${targetClass}"]`);
            
            target.classList.add('found');
            if (targetSlide) {
                targetSlide.classList.add('found');
                // 해당 슬라이드의 인덱스를 찾아서 이동
                const slideIndex = Array.from(targetSlide.parentElement.children).indexOf(targetSlide);
                swiper.slideTo(slideIndex);
            }
            
            // 모든 아이템을 찾았는지 확인
            const foundItems = document.querySelectorAll('.target.found').length;
            const totalItems = document.querySelectorAll('.target').length;
            
            // 찾은 아이템 수 업데이트
            const foundCountElement = document.querySelector('.found-count');
            foundCountElement.textContent = `${foundItems}`;
            
            if (foundItems === totalItems) {
                // 타이머 정지
                clearInterval(timerInterval);
                
                // 최종 시간 기록
                const finalTime = timerElement.textContent;
                
                // 축하 메시지 표시
                setTimeout(() => {
                    complete(finalTime);
                }, 500);
            }
        } else {
            // 빈 공간을 클릭한 경우
            const mark = document.createElement('div');
            mark.className = 'click-mark wrong';
            mark.style.left = `${e.pageX}px`;
            mark.style.top = `${e.pageY}px`;
            mark.style.animation = 'fadeOut 0.5s ease-out forwards';
            
            document.body.appendChild(mark);
            
            // 0.5초 후 요소 제거
            setTimeout(() => {
                mark.remove();
            }, 500);
        }
    });

    // 줌 업데이트 함수
    function updateZoom(scale) {
        const containerRect = container.getBoundingClientRect();
        
        // 현재 중심점 계산
        const centerX = (-currentX + containerRect.width / 2) / currentScale;
        const centerY = (-currentY + containerRect.height / 2) / currentScale;
        
        // 스케일 업데이트
        currentScale = scale;
        
        // background 크기 업데이트 - width만 변경
        const newWidth = Math.min(300 * window.innerWidth * scale / 100, 1440 * scale);
        background.style.width = `${newWidth}px`;
        
        // 새로운 위치 계산
        let newX = -(centerX * scale - containerRect.width / 2);
        let newY = -(centerY * scale - containerRect.height / 2);
        
        // background의 새로운 크기 가져오기
        const backgroundRect = background.getBoundingClientRect();
        
        // 경계 제한 계산
        const minX = containerRect.width - backgroundRect.width;
        const minY = containerRect.height - backgroundRect.height;
        
        // 위치 제한 적용
        if (newX > 0) newX = 0;
        if (newX < minX) newX = minX;
        if (newY > 0) newY = 0;
        if (newY < minY) newY = minY;
        
        // 위치만 적용 (scale 제외)
        currentX = newX;
        currentY = newY;
        background.style.transform = `translate(${newX}px, ${newY}px)`;
        
        requestAnimationFrame(() => {
            updateMinimapViewport();
        });
    }
   
    // 미니맵 업데이트 함수
    function updateMinimapViewport() {
        const containerRect = container.getBoundingClientRect();
        const backgroundRect = background.getBoundingClientRect();
        const minimapContent = document.querySelector('.minimap-content');
        const minimapRect = minimapContent.getBoundingClientRect();

        // 실제 배경 이미지의 원본 크기와 미니맵 크기의 비율 계산
        const scaleX = minimapRect.width / backgroundRect.width;
        const scaleY = minimapRect.height / backgroundRect.height;

        // 컨테이너의 실제 크기를 미니맵 스케일로 변환
        const viewportWidth = containerRect.width * scaleX;
        const viewportHeight = containerRect.height * scaleY;

        // 현재 위치를 미니맵 스케일로 변환
        const viewportX = -currentX * scaleX;
        const viewportY = -currentY * scaleY;

        minimapViewport.style.width = `${viewportWidth}px`;
        minimapViewport.style.height = `${viewportHeight}px`;
        minimapViewport.style.left = `${viewportX}px`;
        minimapViewport.style.top = `${viewportY}px`;
    }

    // 핀치 줌
    function startDragging(e) {
        if (e.type === 'touchstart' && e.touches.length === 2) {
            // 핀치 줌 시작
            e.preventDefault();
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            initialDistance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            );
            initialScale = currentScale;
            return;
        }

        isDragging = true;
        if (e.type === 'mousedown') {
            startX = e.clientX;
            startY = e.clientY;
        } else if (e.type === 'touchstart') {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }
        startPanX = currentX;
        startPanY = currentY;
        background.style.cursor = 'grabbing';
    }

    function drag(e) {
        if (e.type === 'touchmove' && e.touches.length === 2) {
            e.preventDefault();
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const currentDistance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            );

            const scale = (currentDistance / initialDistance) * initialScale;
            const newZoomIndex = findClosestZoomLevel(scale);
            
            if (newZoomIndex !== currentZoomIndex) {
                currentZoomIndex = newZoomIndex;
                updateZoom(zoomLevels[currentZoomIndex]);
            }
            return;
        }

        if (!isDragging) return;
        
        e.preventDefault();
        
        // target-info 숨기기
        const targetInfo = document.querySelector('.target-info');
        targetInfo.style.visibility = 'hidden';
        
        let clientX, clientY;
        if (e.type === 'mousemove') {
            clientX = e.clientX;
            clientY = e.clientY;
        } else if (e.type === 'touchmove') {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        }

        const deltaX = clientX - startX;
        const deltaY = clientY - startY;

        let newX = startPanX + deltaX;
        let newY = startPanY + deltaY;

        // 경계 제한 계산
        const containerRect = container.getBoundingClientRect();
        const backgroundRect = background.getBoundingClientRect();
        
        // 경계 계산
        const minX = containerRect.width - backgroundRect.width;
        const minY = containerRect.height - backgroundRect.height;
        
        // 위치 제한 적용
        if (newX > 0) newX = 0;
        if (newX < minX) newX = minX;
        if (newY > 0) newY = 0;
        if (newY < minY) newY = minY;

        currentX = newX;
        currentY = newY;

        background.style.transform = `translate(${currentX}px, ${currentY}px)`;
        
        // 미니맵 업데이트
        updateMinimapViewport();
    }

    function stopDragging() {
        isDragging = false;
        background.style.cursor = 'grab';
    }

    // 타이머 업데이트 함수
    function updateTimer() {
        const currentTime = Date.now();
        const elapsedTime = Math.floor((currentTime - startTime) / 1000); // 초 단위로 변환
        
        // 99:59를 초과하면 타이머 정지
        if (elapsedTime >= 6000) { // 100분 = 6000초
            clearInterval(timerInterval);
            return;
        }

        const minutes = Math.floor(elapsedTime / 60);
        const seconds = elapsedTime % 60;
        
        // 두 자리 숫자로 포맷팅
        const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        timerElement.textContent = formattedTime;
    }

    // 파노라마 애니메이션 함수
    function playPanorama() {
        if (isPanoramaPlaying) return;
        isPanoramaPlaying = true;

        const panoramaStartTime = Date.now();  // 파노라마용 시작 시간
        const startX = 0;

        function animate() {
            const elapsed = Date.now() - panoramaStartTime;
            const progress = Math.min(elapsed / panoramaDuration, 1);
            
            // easeInOut 효과 적용
            const easeProgress = progress < 0.5
                ? 2 * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 2) / 2;

            const newX = startX + (panoramaDistance * easeProgress);
            
            // 경계 제한 계산
            const containerRect = container.getBoundingClientRect();
            const backgroundRect = background.getBoundingClientRect();
            const minX = containerRect.width - backgroundRect.width;
            
            currentX = Math.max(minX, Math.min(0, newX));
            background.style.transform = `translate(${currentX}px, ${currentY}px)`;
            updateMinimapViewport();

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                isPanoramaPlaying = false;
                // 이미 구한 containerRect와 backgroundRect를 사용하여 중앙 위치 계산
                currentX = (containerRect.width - backgroundRect.width) / 2 + 75;
                currentX = Math.max(minX, Math.min(0, currentX));
                
                background.style.transform = `translate(${currentX}px, ${currentY}px)`;
                updateMinimapViewport();
                startTime = Date.now();
                timerInterval = setInterval(updateTimer, 1000);
            }
        }

        requestAnimationFrame(animate);
    }

    // 가장 가까운 줌 레벨을 찾는 함수 추가
    function findClosestZoomLevel(scale) {
        let closestIndex = 0;
        let minDiff = Math.abs(zoomLevels[0] - scale);

        for (let i = 1; i < zoomLevels.length; i++) {
            const diff = Math.abs(zoomLevels[i] - scale);
            if (diff < minDiff) {
                minDiff = diff;
                closestIndex = i;
            }
        }

        return closestIndex;
    }

    // Swiper 초기화
    const swiper = new Swiper('.swiper', {
        slidesPerView: 4,
        spaceBetween: 20,
        resistance: true,
        resistanceRatio: 0,
        slideToClickedSlide: true
    });

    const backgroundImage = new Image();
    backgroundImage.src = "/images/background.png";
    backgroundImage.onload = function() {
        // 이미지가 로드된 후 게임 시작
        startGame();
    };

    function startGame() {
        // 초기 크기 설정
        updateZoom(currentScale);
         // 초기 미니맵 뷰포트 설정
        updateMinimapViewport();
        // 파노라마 실행
        setTimeout(playPanorama, 500);
    }
});