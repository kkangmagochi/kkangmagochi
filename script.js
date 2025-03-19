document.addEventListener('DOMContentLoaded', function() {
    // 상태 변수
    let stats = {
        affection: 0,
        hunger: 0,
        happiness: 0
    };
    
    let currentCharacter = null;
    let characters = [];
    let apiKey = '';
    let apiModel = 'gemini-2.0-flash';
    let apiConnected = false;
    let favoriteGifts = [];
    let firstVisitDate = null;
    let daysCount = 0;
    
    // DOM 요소
    const characterContainer = document.getElementById('character-container');
    const noCharacterDisplay = document.getElementById('no-character');
    const characterImage = document.getElementById('character-image');
    const profileImage = document.getElementById('profile-image');
    const speechBubble = document.getElementById('speech-bubble');
    const characterSpeech = document.getElementById('character-speech');
    const gameTitle = document.getElementById('game-title');
    const characterStatus = document.getElementById('character-status');
    const daysCountElement = document.getElementById('days-count');
    
    const affectionBar = document.getElementById('affection-bar');
    const hungerBar = document.getElementById('hunger-bar');
    const happinessBar = document.getElementById('happiness-bar');
    const affectionValue = document.getElementById('affection-value');
    const hungerValue = document.getElementById('hunger-value');
    const happinessValue = document.getElementById('happiness-value');
    const resetStatsBtn = document.getElementById('reset-stats');
    
    // 액션 버튼
    const feedButton = document.getElementById('feed-button');
    const playButton = document.getElementById('play-button');
    const giftButton = document.getElementById('gift-button');
    const sleepButton = document.getElementById('sleep-button');
    const customGiftInput = document.getElementById('custom-gift-input');
    const customGiftButton = document.getElementById('custom-gift-button');
    const favoriteGiftsList = document.getElementById('favorite-gifts-list');
    
    // 컨트롤 버튼
    const characterUploadBtn = document.getElementById('character-upload-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const apiConnectionBtn = document.getElementById('api-connection-btn');
    const profileBtn = document.getElementById('profile-btn');
    const shareBtn = document.getElementById('share-btn');
    
    // 모달
    const characterModal = document.getElementById('character-modal');
    const settingsModal = document.getElementById('settings-modal');
    const apiModal = document.getElementById('api-modal');
    const profileModal = document.getElementById('profile-modal');
    const shareModal = document.getElementById('share-modal');
    const nightOverlay = document.getElementById('night-overlay');
    
    // 모달 관련 요소들에 대한 디버그 확인
    console.log('모달 요소 확인:', {
        characterModal: characterModal,
        settingsModal: settingsModal,
        apiModal: apiModal,
        profileModal: profileModal,
        shareModal: shareModal
    });
    
    // 모달 닫기 버튼
    const closeButtons = document.querySelectorAll('.close');
    
    // 캐릭터 업로드 폼
    const characterNameInput = document.getElementById('character-name');
    const characterImgInput = document.getElementById('character-img');
    const existingCharacterRadio = document.getElementById('existing-character');
    const originalCharacterRadio = document.getElementById('original-character');
    const existingCharacterForm = document.getElementById('existing-character-form');
    const originalCharacterForm = document.getElementById('original-character-form');
    const characterGenreInput = document.getElementById('character-genre');
    const characterSpeechStyleInput = document.getElementById('character-speech-style');
    const characterWorldInput = document.getElementById('character-world');
    const characterPersonalityInput = document.getElementById('character-personality');
    const characterSpeechOriginalInput = document.getElementById('character-speech-original');
    const saveCharacterBtn = document.getElementById('save-character');
    const savedCharactersList = document.getElementById('saved-characters-list');
    
    // 설정 폼
    const currentCharacterName = document.getElementById('current-character-name').querySelector('span');
    const customDialogInput = document.getElementById('custom-dialog');
    const customGiftInput = document.getElementById('custom-gift');
    const aiCharacterNameInput = document.getElementById('ai-character-name');
    const saveSettingsBtn = document.getElementById('save-settings');
    
    // API 폼
    const apiKeyInput = document.getElementById('api-key');
    const modelSelect = document.getElementById('model-select');
    const connectApiBtn = document.getElementById('connect-api');
    const connectionStatus = document.getElementById('connection-status');
    const testMessageInput = document.getElementById('test-message');
    const testApiBtn = document.getElementById('test-api');
    const apiResponse = document.getElementById('api-response');
    
    // 프로필 모달
    const profileCharacterName = document.getElementById('profile-character-name').querySelector('span');
    const profileImgInput = document.getElementById('profile-img');
    const saveProfileBtn = document.getElementById('save-profile');
    const profilePreview = document.getElementById('profile-preview');
    
    // 이미지 공유 모달
    const generateImageBtn = document.getElementById('generate-image');
    const shareImageContainer = document.getElementById('share-image-container');
    const downloadImageBtn = document.getElementById('download-image');
    
    // 캐릭터 타입에 따른 폼 표시 설정
    existingCharacterRadio.addEventListener('change', function() {
        if (this.checked) {
            existingCharacterForm.style.display = 'block';
            originalCharacterForm.style.display = 'none';
        }
    });
    
    originalCharacterRadio.addEventListener('change', function() {
        if (this.checked) {
            existingCharacterForm.style.display = 'none';
            originalCharacterForm.style.display = 'block';
        }
    });
    
    // 모달 컨트롤 - 수정된 부분
    characterUploadBtn.addEventListener('click', function() {
        console.log('캐릭터 업로드 버튼 클릭됨');
        characterModal.style.display = 'block';
    });
    
    settingsBtn.addEventListener('click', function() {
        console.log('설정 버튼 클릭됨');
        settingsModal.style.display = 'block';
    });
    
    apiConnectionBtn.addEventListener('click', function() {
        console.log('API 연결 버튼 클릭됨');
        apiModal.style.display = 'block';
    });
    
    profileBtn.addEventListener('click', function() {
        console.log('프로필 사진 버튼 클릭됨');
        if (!currentCharacter) {
            alert('먼저 캐릭터를 선택해주세요.');
            return;
        }
        profileModal.style.display = 'block';
    });
    
    shareBtn.addEventListener('click', function() {
        console.log('이미지 공유 버튼 클릭됨');
        if (!currentCharacter) {
            alert('먼저 캐릭터를 선택해주세요.');
            return;
        }
        shareModal.style.display = 'block';
    });
    
    // 모달 닫기 버튼
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            console.log('모달 닫기 버튼 클릭됨');
            this.closest('.modal').style.display = 'none';
        });
    });
    
    // 창 외부 클릭 시 모달 닫기
    window.addEventListener('click', function(event) {
        if (event.target === characterModal) {
            characterModal.style.display = 'none';
        }
        if (event.target === settingsModal) {
            settingsModal.style.display = 'none';
        }
        if (event.target === apiModal) {
            apiModal.style.display = 'none';
        }
        if (event.target === profileModal) {
            profileModal.style.display = 'none';
        }
        if (event.target === shareModal) {
            shareModal.style.display = 'none';
        }
    });
    
    // 기본 대화 및 선물 목록
    const defaultDialogs = [
        "오늘은 날씨가 좋네요!",
        "같이 놀아요!",
        "뭐하고 있어요?",
        "기분이 좋아요!",
        "심심해요~"
    ];
    
    const defaultGifts = [
        "귀여운 인형",
        "맛있는 초콜릿",
        "예쁜 꽃",
        "특별한 책",
        "멋진 옷"
    ];
    
    // 캐릭터 상태 메시지
    const characterStates = {
        high_affection: [
            "당신을 정말 좋아해요!",
            "오늘도 함께 할 수 있어 행복해요!",
            "당신과 함께 있으면 기분이 좋아요!"
        ],
        normal_affection: [
            "평범한 하루네요",
            "지금은 괜찮은 기분이에요",
            "오늘 뭐 할까요?"
        ],
        low_affection: [
            "조금 외로워요...",
            "저에게 관심이 없나봐요...",
            "더 많이 놀아주세요..."
        ],
        high_hunger: [
            "배가 너무 고파요!",
            "밥 주세요... 배고파요",
            "먹을 것이 필요해요!"
        ],
        normal_hunger: [
            "적당히 배가 찼어요",
            "지금은 배고프진 않아요",
            "조금 더 먹어도 괜찮을 것 같아요"
        ],
        low_hunger: [
            "배가 너무 불러요!",
            "더 이상은 못 먹겠어요",
            "잠시 쉬고 싶어요"
        ],
        high_happiness: [
            "너무 행복해요!",
            "기분이 최고예요!",
            "웃음이 멈추지 않아요!"
        ],
        normal_happiness: [
            "오늘은 평범한 하루예요",
            "평온한 기분이에요",
            "특별한 일이 있으면 좋겠어요"
        ],
        low_happiness: [
            "조금 슬퍼요...",
            "기분이 좋지 않아요",
            "무언가 재미있는 일이 필요해요"
        ]
    };
    
    // 로컬 스토리지에서 데이터 불러오기
    function loadFromLocalStorage() {
        // 처음 방문한 날짜 확인
        const savedVisitDate = localStorage.getItem('firstVisitDate');
        if (savedVisitDate) {
            firstVisitDate = new Date(savedVisitDate);
            updateDaysCount();
        } else {
            firstVisitDate = new Date();
            localStorage.setItem('firstVisitDate', firstVisitDate.toISOString());
            daysCountElement.textContent = '0';
        }
    
        const savedCharacters = localStorage.getItem('tamagotchiCharacters');
        if (savedCharacters) {
            characters = JSON.parse(savedCharacters);
            renderSavedCharacters();
        }
        
        const savedStats = localStorage.getItem('tamagotchiStats');
        if (savedStats) {
            stats = JSON.parse(savedStats);
            updateStatsDisplay();
        }
        
        const savedCurrentCharacter = localStorage.getItem('currentCharacter');
        if (savedCurrentCharacter) {
            currentCharacter = JSON.parse(savedCurrentCharacter);
            displayCurrentCharacter();
        }
        
        const savedApiKey = localStorage.getItem('geminiApiKey');
        if (savedApiKey) {
            apiKey = savedApiKey;
            apiKeyInput.value = apiKey;
        }
        
        const savedApiModel = localStorage.getItem('geminiApiModel');
        if (savedApiModel) {
            apiModel = savedApiModel;
            modelSelect.value = apiModel;
        }
        
        if (apiKey) {
            testApiConnection();
        }
        
        const savedFavoriteGifts = localStorage.getItem('favoriteGifts');
        if (savedFavoriteGifts) {
            favoriteGifts = JSON.parse(savedFavoriteGifts);
            renderFavoriteGifts();
        }
    }
    
    // 로컬 스토리지에 데이터 저장
    function saveToLocalStorage() {
        localStorage.setItem('tamagotchiCharacters', JSON.stringify(characters));
        localStorage.setItem('tamagotchiStats', JSON.stringify(stats));
        localStorage.setItem('favoriteGifts', JSON.stringify(favoriteGifts));
        
        if (currentCharacter) {
            localStorage.setItem('currentCharacter', JSON.stringify(currentCharacter));
        }
        
        if (apiKey) {
            localStorage.setItem('geminiApiKey', apiKey);
        }
        
        if (apiModel) {
            localStorage.setItem('geminiApiModel', apiModel);
        }
    }
    
    // 방문일 수 계산 및 업데이트
    function updateDaysCount() {
        if (!firstVisitDate) return;
        
        const currentDate = new Date();
        const timeDiff = currentDate.getTime() - firstVisitDate.getTime();
        const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
        
        daysCount = daysDiff;
        daysCountElement.textContent = daysCount;
    }
    
    // 스탯 리셋
    resetStatsBtn.addEventListener('click', function() {
        stats = {
            affection: 0,
            hunger: 0,
            happiness: 0
        };
        updateStatsDisplay();
        showSpeechBubble("스탯이 리셋되었어요!");
        updateCharacterState();
    });
    
    // 스탯 표시 업데이트
    function updateStatsDisplay() {
        affectionBar.style.width = `${stats.affection}%`;
        hungerBar.style.width = `${stats.hunger}%`;
        happinessBar.style.width = `${stats.happiness}%`;
        
        affectionValue.textContent = Math.round(stats.affection);
        hungerValue.textContent = Math.round(stats.hunger);
        happinessValue.textContent = Math.round(stats.happiness);
        
        saveToLocalStorage();
        updateCharacterState();
    }
    
    // 캐릭터 상태 업데이트
    function updateCharacterState() {
        if (!currentCharacter || !characterStatus) return;
        
        let state;
        const random = Math.random();
        
        // 호감도, 허기, 행복도 상태에 따라 메시지 결정
        if (stats.affection > 70 && random < 0.33) {
            state = characterStates.high_affection[Math.floor(Math.random() * characterStates.high_affection.length)];
        } else if (stats.affection < 30 && random < 0.33) {
            state = characterStates.low_affection[Math.floor(Math.random() * characterStates.low_affection.length)];
        } else if (stats.hunger > 70 && random < 0.33) {
            state = characterStates.low_hunger[Math.floor(Math.random() * characterStates.low_hunger.length)];
        } else if (stats.hunger < 30 && random < 0.33) {
            state = characterStates.high_hunger[Math.floor(Math.random() * characterStates.high_hunger.length)];
        } else if (stats.happiness > 70 && random < 0.33) {
            state = characterStates.high_happiness[Math.floor(Math.random() * characterStates.high_happiness.length)];
        } else if (stats.happiness < 30 && random < 0.33) {
            state = characterStates.low_happiness[Math.floor(Math.random() * characterStates.low_happiness.length)];
        } else {
            // 기본 상태 메시지
            if (stats.affection > 30 && stats.affection < 70) {
                state = characterStates.normal_affection[Math.floor(Math.random() * characterStates.normal_affection.length)];
            } else if (stats.hunger > 30 && stats.hunger < 70) {
                state = characterStates.normal_hunger[Math.floor(Math.random() * characterStates.normal_hunger.length)];
            } else {
                state = characterStates.normal_happiness[Math.floor(Math.random() * characterStates.normal_happiness.length)];
            }
        }
        
        characterStatus.innerHTML = `<p>상태: ${state}</p>`;
    }
    
    // 게임 타이틀 업데이트
    function updateGameTitle() {
        if (currentCharacter) {
            gameTitle.textContent = `${currentCharacter.name} 키우기`;
            document.title = `${currentCharacter.name} 키우기`;
        } else {
            gameTitle.textContent = '깡통 키우기';
            document.title = '깡통 키우기';
        }
    }
    
    // 현재 캐릭터 표시
    function displayCurrentCharacter() {
        if (currentCharacter) {
            characterImage.src = currentCharacter.image;
            
            // 프로필 이미지 설정
            if (currentCharacter.profileImage) {
                profileImage.src = currentCharacter.profileImage;
                document.getElementById('profile-frame').style.display = 'block';
                profilePreview.src = currentCharacter.profileImage;
            } else {
                document.getElementById('profile-frame').style.display = 'none';
                profilePreview.src = '';
            }
            
            noCharacterDisplay.classList.remove('show');
            noCharacterDisplay.classList.add('hide');
            characterContainer.classList.remove('hide');
            characterContainer.classList.add('show');
            
            // 게임 타이틀 업데이트
            updateGameTitle();
            
            // 현재 캐릭터 이름 설정 창에 표시
            currentCharacterName.textContent = currentCharacter.name;
            profileCharacterName.textContent = currentCharacter.name;
            
            // 설정 로드
            if (currentCharacter.customDialog) {
                customDialogInput.value = currentCharacter.customDialog;
            } else {
                customDialogInput.value = '';
            }
            
            if (currentCharacter.customGift) {
                customGiftInput.value = currentCharacter.customGift;
            } else {
                customGiftInput.value = '';
            }
            
            if (currentCharacter.aiCharacterName) {
                aiCharacterNameInput.value = currentCharacter.aiCharacterName;
            } else {
                aiCharacterNameInput.value = '';
            }
            
            // 캐릭터 상태 표시
            updateCharacterState();
            
            // AI가 연결되어 있다면 인사말을 AI로부터 받아옴
            if (apiConnected) {
                callGeminiAPI(`인사말을 친근하게 해줘.`, showSpeechBubble);
            } else {
                // 기본 인사말 표시
                showSpeechBubble(`안녕하세요! 저는 ${currentCharacter.name}이에요!`);
            }
            
            // 좋아하는 선물 목록 생성 (AI 연결된 경우)
            if (apiConnected && favoriteGifts.length === 0) {
                generateFavoriteGifts();
            }
        } else {
            noCharacterDisplay.classList.remove('hide');
            noCharacterDisplay.classList.add('show');
            characterContainer.classList.remove('show');
            characterContainer.classList.add('hide');
            
            // 게임 타이틀 업데이트
            updateGameTitle();
            
            // 설정 창 초기화
            currentCharacterName.textContent = '없음';
            profileCharacterName.textContent = '없음';
            customDialogInput.value = '';
            customGiftInput.value = '';
            aiCharacterNameInput.value = '';
        }
    }
    
    // AI를 통해 좋아하는 선물 목록 생성
    function generateFavoriteGifts() {
        if (!currentCharacter || !apiConnected) return;
        
        const prompt = `${currentCharacter.name}이(가) 좋아할 만한 선물 5가지를 콤마(,)로 구분해서 선물 이름만 단순하게 나열해줘. 예시 형식: "선물1, 선물2, 선물3, 선물4, 선물5"`;
        
        callGeminiAPI(prompt, function(response) {
            // 콤마로 구분된 선물 목록 파싱
            const gifts = response.split(',').map(gift => gift.trim()).filter(gift => gift !== '');
            
            // 중복 제거 및 빈 문자열 제거
            const uniqueGifts = [...new Set(gifts)].filter(gift => gift !== '');
            
            // 최대 5개만 저장
            favoriteGifts = uniqueGifts.slice(0, 5);
            
            // 선물 목록 렌더링
            renderFavoriteGifts();
            saveToLocalStorage();
        });
    }
    
    // 좋아하는 선물 목록 렌더링
    function renderFavoriteGifts() {
        favoriteGiftsList.innerHTML = '';
        
        favoriteGifts.forEach((gift, index) => {
            const giftTag = document.createElement('div');
            giftTag.className = 'gift-tag';
            giftTag.innerHTML = `
                <span class="gift-name">${gift}</span>
                <span class="remove-gift" data-index="${index}">×</span>
            `;
            
            // 선물 클릭 시 선물 주기
            giftTag.querySelector('.gift-name').addEventListener('click', () => {
                giveGift(gift);
            });
            
            // 삭제 버튼 클릭 시 선물 제거
            giftTag.querySelector('.remove-gift').addEventListener('click', (e) => {
                e.stopPropagation();
                const idx = parseInt(e.target.getAttribute('data-index'));
                favoriteGifts.splice(idx, 1);
                renderFavoriteGifts();
                saveToLocalStorage();
            });
            
            favoriteGiftsList.appendChild(giftTag);
        });
    }
    
    // 선물 주기 함수 (커스텀 선물)
    function giveGift(giftName) {
        if (!currentCharacter) return;
        
        // 스탯 변경
        stats.affection = Math.min(100, stats.affection + 15);
        stats.happiness = Math.min(100, stats.happiness + 10);
        updateStatsDisplay();
        
        // 캐릭터 애니메이션
        animateCharacter();
        
        // AI 연결된 경우 API를 통해 선물 반응 생성
        if (apiConnected) {
            const prompt = `${giftName}(이)라는 선물을 받았을 때의 반응을 간단하게 보여줘.`;
            callGeminiAPI(prompt, showSpeechBubble);
        } else {
            showSpeechBubble(`${giftName}! 정말 좋아해요! 고마워요!`);
        }
    }
    
    // 말풍선 표시
    function showSpeechBubble(text) {
        characterSpeech.textContent = text;
        speechBubble.classList.remove('hide');
        
        // 3초 후 말풍선 숨기기
        setTimeout(() => {
            speechBubble.classList.add('hide');
        }, 3000);
    }
    
    // 저장된 캐릭터 목록 렌더링
    function renderSavedCharacters() {
        savedCharactersList.innerHTML = '';
        
        characters.forEach((char, index) => {
            const characterCard = document.createElement('div');
            characterCard.className = 'character-card';
            characterCard.innerHTML = `
                <img src="${char.image}" alt="${char.name}">
                <p>${char.name}</p>
            `;
            
            characterCard.addEventListener('click', () => {
                loadCharacter(index);
                characterModal.style.display = 'none';
            });
            
            savedCharactersList.appendChild(characterCard);
        });
    }
    
    // 캐릭터 로드
    function loadCharacter(index) {
        currentCharacter = characters[index];
        displayCurrentCharacter();
        
        // 스탯 리셋
        stats = {
            affection: 0,
            hunger: 0,
            happiness: 0
        };
        
        updateStatsDisplay();
    }
    
    // 캐릭터 애니메이션 (위아래로 움직임)
    function animateCharacter() {
        characterImage.classList.add('bounce');
        
        // 애니메이션이 끝나면 클래스 제거
        setTimeout(() => {
            characterImage.classList.remove('bounce');
        }, 500);
    }
    
    // 랜덤 대화 선택
    function getRandomDialog() {
        if (!currentCharacter) return defaultDialogs[Math.floor(Math.random() * defaultDialogs.length)];
        
        let dialogs = defaultDialogs;
        
        if (currentCharacter.customDialog && currentCharacter.customDialog.trim() !== '') {
            dialogs = currentCharacter.customDialog.split(',').map(dialog => dialog.trim());
            if (dialogs.length === 0 || (dialogs.length === 1 && dialogs[0] === '')) {
                dialogs = defaultDialogs;
            }
        }
        
        return dialogs[Math.floor(Math.random() * dialogs.length)];
    }
    
    // 랜덤 선물 선택
    function getRandomGift() {
        if (!currentCharacter) return defaultGifts[Math.floor(Math.random() * defaultGifts.length)];
        
        let gifts = defaultGifts;
        
        if (currentCharacter.customGift && currentCharacter.customGift.trim() !== '') {
            gifts = currentCharacter.customGift.split(',').map(gift => gift.trim());
            if (gifts.length === 0 || (gifts.length === 1 && gifts[0] === '')) {
                gifts = defaultGifts;
            }
        }
        
        return gifts[Math.floor(Math.random() * gifts.length)];
    }
    
    // 밤/낮 전환 애니메이션
    function playNightAnimation() {
        // 밤 효과 표시
        nightOverlay.style.opacity = '1';
        
        // 1.5초 후 밤 효과 숨기기
        setTimeout(() => {
            nightOverlay.style.opacity = '0';
        }, 1500);
    }
    
    // 캐릭터 이미지 클릭 이벤트
    characterImage.addEventListener('click', () => {
        if (!currentCharacter) return;
        
        // 애니메이션 실행
        animateCharacter();
        
        // AI 연결된 경우 API를 통해 대화 생성
        if (apiConnected) {
            callGeminiAPI('캐릭터를 클릭했을 때 짧고 귀여운 반응을 보여줘', showSpeechBubble);
        } else {
            // 랜덤 대화 표시
            showSpeechBubble(getRandomDialog());
        }
    });
    
    // 액션 버튼 이벤트
    feedButton.addEventListener('click', () => {
        if (!currentCharacter) return;
        
        // 스탯 변경
        stats.hunger = Math.min(100, stats.hunger + 20);
        stats.happiness = Math.min(100, stats.happiness + 5);
        updateStatsDisplay();
        
        // 캐릭터 애니메이션
        animateCharacter();
        
        // AI 연결된 경우 API를 통해 밥 먹는 반응 생성
        if (apiConnected) {
            const prompt = `밥을 먹었을 때의 반응을 짧게 보여줘.`;
            callGeminiAPI(prompt, showSpeechBubble);
        } else {
            showSpeechBubble('맛있어요! 감사합니다!');
        }
    });
    
    playButton.addEventListener('click', () => {
        if (!currentCharacter) return;
        
        // 스탯 변경
        stats.happiness = Math.min(100, stats.happiness + 20);
        stats.affection = Math.min(100, stats.affection + 10);
        stats.hunger = Math.max(0, stats.hunger - 5);
        updateStatsDisplay();
        
        // 캐릭터 애니메이션
        animateCharacter();
        
        // AI 연결된 경우 API를 통해 놀이 반응 생성
        if (apiConnected) {
            const prompt = `놀이를 할 때의 반응을 짧게 보여줘.`;
            callGeminiAPI(prompt, showSpeechBubble);
        } else {
            showSpeechBubble(getRandomDialog());
        }
    });
    
    giftButton.addEventListener('click', () => {
        if (!currentCharacter) return;
        
        // 스탯 변경
        stats.affection = Math.min(100, stats.affection + 20);
        stats.happiness = Math.min(100, stats.happiness + 15);
        updateStatsDisplay();
        
        // 선물 선택
        const gift = getRandomGift();
        
        // 캐릭터 애니메이션
        animateCharacter();
        
        // AI 연결된 경우 API를 통해 선물 반응 생성
        if (apiConnected) {
            const prompt = `${gift}(이)라는 선물을 받았을 때의 반응을 간단하게 보여줘.`;
            callGeminiAPI(prompt, showSpeechBubble);
        } else {
            showSpeechBubble(`${gift}! 정말 좋아해요!`);
        }
    });
    
    sleepButton.addEventListener('click', () => {
        if (!currentCharacter) return;
        
        // 밤/낮 전환 애니메이션
        playNightAnimation();
        
        // 시간이 지남에 따른 스탯 변화
        setTimeout(() => {
            // 수면 중 허기 감소 (큰 폭으로)
            stats.hunger = Math.max(0, stats.hunger - 30);
            
            // 수면에 따른 호감도와 행복도 변화 (요청대로 변화 폭 증가)
            if (stats.hunger < 20) {
                // 배고프면 행복도와 호감도 감소
                stats.happiness = Math.max(0, stats.happiness - 25);
                stats.affection = Math.max(0, stats.affection - 15);
                
                if (apiConnected) {
                    callGeminiAPI('배가 고픈 상태에서 잠에서 깨어났을 때의 반응을 짧게 보여줘.', showSpeechBubble);
                } else {
                    showSpeechBubble('배고파요... 밥 주세요ㅠㅠ');
                }
            } else {
                // 배부르면 행복도와 호감도 증가
                stats.happiness = Math.min(100, stats.happiness + 15);
                stats.affection = Math.min(100, stats.affection + 10);
                
                if (apiConnected) {
                    callGeminiAPI('잘 자고 일어났을 때의 반응을 짧게 보여줘.', showSpeechBubble);
                } else {
                    showSpeechBubble('잘 잤어요! 기분이 좋아요!');
                }
            }
            
            updateStatsDisplay();
        }, 1500);
    });
    
    // 커스텀 선물 주기
    customGiftButton.addEventListener('click', () => {
        const giftName = customGiftInput.value.trim();
        
        if (!currentCharacter || giftName === '') return;
        
        giveGift(giftName);
        customGiftInput.value = '';
    });
    
    // 캐릭터 저장
    saveCharacterBtn.addEventListener('click', () => {
        const name = characterNameInput.value.trim();
        const fileInput = characterImgInput;
        
        if (name === '' || !fileInput.files || fileInput.files.length === 0) {
            alert('캐릭터 이름과 이미지를 모두 입력해주세요.');
            return;
        }
        
        const file = fileInput.files[0];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            let characterInfo = {};
            
            if (existingCharacterRadio.checked) {
                // 기존 작품 캐릭터
                characterInfo = {
                    name: name,
                    image: e.target.result,
                    customDialog: '',
                    customGift: '',
                    aiCharacterName: '',
                    characterType: 'existing',
                    genre: characterGenreInput.value.trim(),
                    speechStyle: characterSpeechStyleInput.value.trim()
                };
            } else {
                // 오리지널 캐릭터
                characterInfo = {
                    name: name,
                    image: e.target.result,
                    customDialog: '',
                    customGift: '',
                    aiCharacterName: '',
                    characterType: 'original',
                    world: characterWorldInput.value.trim(),
                    personality: characterPersonalityInput.value.trim(),
                    speechStyle: characterSpeechOriginalInput.value.trim()
                };
            }
            
            characters.push(characterInfo);
            saveToLocalStorage();
            renderSavedCharacters();
            
            // 폼 초기화
            characterNameInput.value = '';
            fileInput.value = '';
            characterGenreInput.value = '';
            characterSpeechStyleInput.value = '';
            characterWorldInput.value = '';
            characterPersonalityInput.value = '';
            characterSpeechOriginalInput.value = '';
            
            // 새 캐릭터를 현재 캐릭터로 설정
            currentCharacter = characterInfo;
            displayCurrentCharacter();
            
            // 초기 스탯 설정
            stats = {
                affection: 0,
                hunger: 0,
                happiness: 0
            };
            updateStatsDisplay();
            
            // 좋아하는 선물 목록 초기화
            favoriteGifts = [];
            renderFavoriteGifts();
            
            // AI가 연결되어 있다면 선물 목록 생성
            if (apiConnected) {
                generateFavoriteGifts();
            }
        };
        
        reader.readAsDataURL(file);
    });
    
    // 설정 저장
    saveSettingsBtn.addEventListener('click', () => {
        if (!currentCharacter) {
            alert('먼저 캐릭터를 선택해주세요.');
            return;
        }
        
        // 현재 캐릭터의 설정 업데이트
        currentCharacter.customDialog = customDialogInput.value.trim();
        currentCharacter.customGift = customGiftInput.value.trim();
        currentCharacter.aiCharacterName = aiCharacterNameInput.value.trim();
        
        // characters 배열에서 현재 캐릭터 업데이트
        const index = characters.findIndex(char => char.name === currentCharacter.name);
        if (index !== -1) {
            characters[index] = currentCharacter;
        }
        
        saveToLocalStorage();
        settingsModal.style.display = 'none';
        
        // 저장 완료 메시지
        showSpeechBubble('설정이 저장되었어요!');
    });
    
    // 프로필 이미지 저장
    saveProfileBtn.addEventListener('click', () => {
        if (!currentCharacter) {
            alert('먼저 캐릭터를 선택해주세요.');
            return;
        }
        
        const fileInput = profileImgInput;
        
        if (!fileInput.files || fileInput.files.length === 0) {
            alert('프로필 이미지를 선택해주세요.');
            return;
        }
        
        const file = fileInput.files[0];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            currentCharacter.profileImage = e.target.result;
            
            // characters 배열에서 현재 캐릭터 업데이트
            const index = characters.findIndex(char => char.name === currentCharacter.name);
            if (index !== -1) {
                characters[index] = currentCharacter;
            }
            
            saveToLocalStorage();
            profileModal.style.display = 'none';
            
            // 프로필 이미지 업데이트
            profileImage.src = currentCharacter.profileImage;
            document.getElementById('profile-frame').style.display = 'block';
            
            // 저장 완료 메시지
            showSpeechBubble('프로필 사진이 저장되었어요!');
        };
        
        reader.readAsDataURL(file);
    });
    
    // 이미지 생성 및 다운로드
    generateImageBtn.addEventListener('click', () => {
        if (!currentCharacter) {
            alert('먼저 캐릭터를 선택해주세요.');
            return;
        }
        
        // html2canvas가 로드되어 있는지 확인
        if (typeof html2canvas !== 'function') {
            alert('이미지 생성 라이브러리가 로드되지 않았습니다. 페이지를 새로고침해주세요.');
            console.error('html2canvas 라이브러리를 불러오지 못했습니다.');
            return;
        }
        
        // 다마고치 프레임을 이미지로 캡처
        html2canvas(document.querySelector('.tamagotchi-frame')).then(canvas => {
            shareImageContainer.innerHTML = '';
            shareImageContainer.appendChild(canvas);
            
            downloadImageBtn.disabled = false;
            
            // 다운로드 버튼 이벤트
            downloadImageBtn.onclick = function() {
                const link = document.createElement('a');
                link.download = `${currentCharacter.name}_tamagotchi.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            };
        });
    });
    
    // API 연결 테스트 - 실제 API 연결 (Gemini 모델 사용)
    function testApiConnection() {
        connectionStatus.textContent = '테스트 중...';
        connectionStatus.style.color = 'orange';
        testApiBtn.disabled = true;
        apiConnected = false;
        
        if (apiKey.trim() === '') {
            connectionStatus.textContent = '연결되지 않음';
            connectionStatus.style.color = 'red';
            return;
        }
        
        // Gemini API 최신 엔드포인트
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${apiModel}:generateContent?key=${apiKey}`;
        
        // 테스트 요청 전송
        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: "안녕하세요. 이 메시지는 API 키가 유효한지 확인하기 위한 테스트입니다."
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 100
                }
            })
        })
        .then(response => {
            if (!response.ok) {
                // 오류 세부 정보 추출
                return response.json().then(errorData => {
                    throw new Error(`API 요청 실패: ${errorData.error?.message || '알 수 없는 오류'}`);
                });
            }
            return response.json();
        })
        .then(data => {
            console.log("API 응답:", data); // 디버깅용
            
            // API 응답 확인
            if (data.candidates && data.candidates.length > 0 && data.candidates[0].content) {
                connectionStatus.textContent = '연결됨';
                connectionStatus.style.color = 'green';
                testApiBtn.disabled = false;
                apiConnected = true;
                
                // 캐릭터가 있다면 상태 메시지 및 좋아하는 선물 업데이트
                if (currentCharacter) {
                    updateCharacterState();
                    
                    // 좋아하는 선물 목록이 비어있다면 생성
                    if (favoriteGifts.length === 0) {
                        generateFavoriteGifts();
                    }
                }
            } else {
                throw new Error('API 응답 형식이 올바르지 않습니다');
            }
        })
        .catch(error => {
            connectionStatus.textContent = `연결 실패: ${error.message}`;
            connectionStatus.style.color = 'red';
            console.error('API 연결 오류:', error);
        });
    }
    
    // API 연결 버튼
    connectApiBtn.addEventListener('click', () => {
        apiKey = apiKeyInput.value.trim();
        apiModel = modelSelect.value;
        
        localStorage.setItem('geminiApiKey', apiKey);
        localStorage.setItem('geminiApiModel', apiModel);
        
        testApiConnection();
    });
    
    // Gemini API 호출 함수
    function callGeminiAPI(prompt, callback) {
        if (!apiConnected || !apiKey || !currentCharacter) return;
        
        const aiName = currentCharacter.aiCharacterName || currentCharacter.name;
        
        // 캐릭터 정보 구성
        let characterInfo = `캐릭터 이름: ${currentCharacter.name}`;
        
        if (currentCharacter.characterType === 'existing') {
            if (currentCharacter.genre) characterInfo += `, 장르: ${currentCharacter.genre}`;
            if (currentCharacter.speechStyle) characterInfo += `, 말투: ${currentCharacter.speechStyle}`;
        } else {
            if (currentCharacter.world) characterInfo += `, 세계관: ${currentCharacter.world}`;
            if (currentCharacter.personality) characterInfo += `, 성격: ${currentCharacter.personality}`;
            if (currentCharacter.speechStyle) characterInfo += `, 말투: ${currentCharacter.speechStyle}`;
        }
        
        // Gemini API 최신 버전 호출
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${apiModel}:generateContent?key=${apiKey}`;
        
        const systemPrompt = `You will now talk to users as a character named '${aiName}'. ${aiName} will react as a character in a simple raising game. Please respond vividly as if you were a real character, taking advantage of ${aiName}'s original worldview, character personality, and speech. Always respond briefly and concisely (within 2-3 sentences), and you may use appropriate emoticons when necessary. Respond naturally to users' messages by taking advantage of ${aiName}'s characteristics. Always output your replies in Korean.

캐릭터 정보: ${characterInfo}

현재 상태:
호감도: ${stats.affection}/100
허기: ${stats.hunger}/100
행복도: ${stats.happiness}/100

사용자 요청: ${prompt}`;
        
        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            { text: systemPrompt }
                        ]
                    }
                ],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 150,
                    topP: 0.95,
                    topK: 40
                },
                safetySettings: [
                    {
                        category: "HARM_CATEGORY_HARASSMENT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_HATE_SPEECH",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    }
                ]
            })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(errorData => {
                    throw new Error(`API 요청 실패: ${errorData.error?.message || '알 수 없는 오류'}`);
                });
            }
            return response.json();
        })
        .then(data => {
            console.log("API 응답:", data); // 디버깅용
            
            if (data.candidates && data.candidates.length > 0 && data.candidates[0].content) {
                const aiResponse = data.candidates[0].content.parts[0].text;
                if (callback && typeof callback === 'function') {
                    callback(aiResponse);
                }
            } else {
                throw new Error('API 응답 형식이 올바르지 않습니다');
            }
        })
        .catch(error => {
            console.error('API 호출 오류:', error);
            if (callback && typeof callback === 'function') {
                callback(`API 오류: ${error.message}`);
            }
        });
    }
    
    // API 테스트 버튼
    testApiBtn.addEventListener('click', () => {
        const testMessage = testMessageInput.value.trim();
        
        if (testMessage === '') {
            alert('테스트 메시지를 입력해주세요.');
            return;
        }
        
        if (!apiConnected) {
            alert('먼저 API를 연결해주세요.');
            return;
        }
        
        apiResponse.innerHTML = '<p>API 호출 중...</p>';
        
        callGeminiAPI(testMessage, function(response) {
            apiResponse.innerHTML = `<p>${response}</p>`;
        });
    });
    
    // 초기화
    loadFromLocalStorage();
    displayCurrentCharacter();
    updateStatsDisplay();
    
    // 이미지 공유 기능을 위한 html2canvas 로드 확인
    if (typeof html2canvas === 'undefined') {
        console.warn('html2canvas 라이브러리가 로드되지 않았습니다. 이미지 공유 기능이 작동하지 않을 수 있습니다.');
    }
});

// script.js의 맨 아래에 추가
document.addEventListener('DOMContentLoaded', function() {
    // 모달 버튼들 직접 선택
    const characterUploadBtn = document.getElementById('character-upload-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const apiConnectionBtn = document.getElementById('api-connection-btn');
    const profileBtn = document.getElementById('profile-btn');
    const shareBtn = document.getElementById('share-btn');
    
    // 모달 요소들 직접 선택
    const characterModal = document.getElementById('character-modal');
    const settingsModal = document.getElementById('settings-modal');
    const apiModal = document.getElementById('api-modal');
    const profileModal = document.getElementById('profile-modal');
    const shareModal = document.getElementById('share-modal');
    
    // 이벤트 리스너 직접 추가
    if(characterUploadBtn && characterModal) {
        characterUploadBtn.onclick = function() { 
            characterModal.style.display = 'block'; 
            console.log('캐릭터 업로드 모달 열림');
        };
    }
    
    if(settingsBtn && settingsModal) {
        settingsBtn.onclick = function() { 
            settingsModal.style.display = 'block'; 
            console.log('설정 모달 열림');
        };
    }
    
    if(apiConnectionBtn && apiModal) {
        apiConnectionBtn.onclick = function() { 
            apiModal.style.display = 'block';
            console.log('API 연결 모달 열림'); 
        };
    }
    
    if(profileBtn && profileModal) {
        profileBtn.onclick = function() {
            if (!currentCharacter) {
                alert('먼저 캐릭터를 선택해주세요.');
                return;
            }
            profileModal.style.display = 'block';
            console.log('프로필 모달 열림');
        };
    }
    
    if(shareBtn && shareModal) {
        shareBtn.onclick = function() {
            if (!currentCharacter) {
                alert('먼저 캐릭터를 선택해주세요.');
                return;
            }
            shareModal.style.display = 'block';
            console.log('공유 모달 열림');
        };
    }
});
