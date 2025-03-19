document.addEventListener('DOMContentLoaded', function() {
    // 상태 변수
    let stats = {
        affection: 50,
        hunger: 50,
        happiness: 50
    };
    
    let currentCharacter = null;
    let characters = [];
    let apiKey = '';
    let apiConnected = false;
    
    // DOM 요소
    const characterContainer = document.getElementById('character-container');
    const noCharacterDisplay = document.getElementById('no-character');
    const characterImage = document.getElementById('character-image');
    const speechBubble = document.getElementById('speech-bubble');
    const characterSpeech = document.getElementById('character-speech');
    const gameTitle = document.getElementById('game-title');
    
    const affectionBar = document.getElementById('affection-bar');
    const hungerBar = document.getElementById('hunger-bar');
    const happinessBar = document.getElementById('happiness-bar');
    const affectionValue = document.getElementById('affection-value');
    const hungerValue = document.getElementById('hunger-value');
    const happinessValue = document.getElementById('happiness-value');
    
    // 액션 버튼
    const feedButton = document.getElementById('feed-button');
    const playButton = document.getElementById('play-button');
    const giftButton = document.getElementById('gift-button');
    const sleepButton = document.getElementById('sleep-button');
    
    // 컨트롤 버튼
    const characterUploadBtn = document.getElementById('character-upload-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const apiConnectionBtn = document.getElementById('api-connection-btn');
    
    // 모달
    const characterModal = document.getElementById('character-modal');
    const settingsModal = document.getElementById('settings-modal');
    const apiModal = document.getElementById('api-modal');
    const nightOverlay = document.getElementById('night-overlay');
    
    // 디버깅용 로그 - 모달 요소 확인
    console.log('모달 요소 확인:', {
        characterModal: characterModal,
        settingsModal: settingsModal,
        apiModal: apiModal
    });
    
    // 모달 닫기 버튼
    const closeButtons = document.querySelectorAll('.close');
    
    // 캐릭터 업로드 폼
    const characterNameInput = document.getElementById('character-name');
    const characterImgInput = document.getElementById('character-img');
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
    const connectApiBtn = document.getElementById('connect-api');
    const connectionStatus = document.getElementById('connection-status');
    const testMessageInput = document.getElementById('test-message');
    const testApiBtn = document.getElementById('test-api');
    const apiResponse = document.getElementById('api-response');
    
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
    
    // 로컬 스토리지에서 데이터 불러오기
    function loadFromLocalStorage() {
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
            testApiConnection();
        }
    }
    
    // 로컬 스토리지에 데이터 저장
    function saveToLocalStorage() {
        localStorage.setItem('tamagotchiCharacters', JSON.stringify(characters));
        localStorage.setItem('tamagotchiStats', JSON.stringify(stats));
        if (currentCharacter) {
            localStorage.setItem('currentCharacter', JSON.stringify(currentCharacter));
        }
        if (apiKey) {
            localStorage.setItem('geminiApiKey', apiKey);
        }
    }
    
    // 스탯 표시 업데이트
    function updateStatsDisplay() {
        affectionBar.style.width = `${stats.affection}%`;
        hungerBar.style.width = `${stats.hunger}%`;
        happinessBar.style.width = `${stats.happiness}%`;
        
        affectionValue.textContent = Math.round(stats.affection);
        hungerValue.textContent = Math.round(stats.hunger);
        happinessValue.textContent = Math.round(stats.happiness);
        
        saveToLocalStorage();
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
            noCharacterDisplay.classList.remove('show');
            noCharacterDisplay.classList.add('hide');
            characterContainer.classList.remove('hide');
            characterContainer.classList.add('show');
            
            // 게임 타이틀 업데이트
            updateGameTitle();
            
            // 현재 캐릭터 이름 설정 창에 표시
            currentCharacterName.textContent = currentCharacter.name;
            
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
            
            // 인사말 표시
            showSpeechBubble(`안녕하세요! 저는 ${currentCharacter.name}이에요!`);
        } else {
            noCharacterDisplay.classList.remove('hide');
            noCharacterDisplay.classList.add('show');
            characterContainer.classList.remove('show');
            characterContainer.classList.add('hide');
            
            // 게임 타이틀 업데이트
            updateGameTitle();
            
            // 설정 창 초기화
            currentCharacterName.textContent = '없음';
            customDialogInput.value = '';
            customGiftInput.value = '';
            aiCharacterNameInput.value = '';
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
            affection: 50,
            hunger: 50,
            happiness: 50
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
        
        // 랜덤 대화 표시
        showSpeechBubble(getRandomDialog());
    });
    
    // 액션 버튼 이벤트
    feedButton.addEventListener('click', () => {
        if (!currentCharacter) return;
        
        // 스탯 변경
        stats.hunger = Math.min(100, stats.hunger + 20);
        stats.happiness = Math.min(100, stats.happiness + 5);
        updateStatsDisplay();
        
        // 캐릭터 반응
        showSpeechBubble('맛있어요! 감사합니다!');
        animateCharacter();
    });
    
    playButton.addEventListener('click', () => {
        if (!currentCharacter) return;
        
        // 스탯 변경
        stats.happiness = Math.min(100, stats.happiness + 20);
        stats.affection = Math.min(100, stats.affection + 10);
        stats.hunger = Math.max(0, stats.hunger - 5);
        updateStatsDisplay();
        
        // 캐릭터 반응
        showSpeechBubble(getRandomDialog());
        animateCharacter();
    });
    
    giftButton.addEventListener('click', () => {
        if (!currentCharacter) return;
        
        // 스탯 변경
        stats.affection = Math.min(100, stats.affection + 20);
        stats.happiness = Math.min(100, stats.happiness + 15);
        updateStatsDisplay();
        
        // 선물 선택
        const gift = getRandomGift();
        
        // 캐릭터 반응
        showSpeechBubble(`${gift}! 정말 좋아해요!`);
        animateCharacter();
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
                showSpeechBubble('배고파요... 밥 주세요ㅠㅠ');
            } else {
                // 배부르면 행복도와 호감도 증가
                stats.happiness = Math.min(100, stats.happiness + 15);
                stats.affection = Math.min(100, stats.affection + 10);
                showSpeechBubble('잘 잤어요! 기분이 좋아요!');
            }
            
            updateStatsDisplay();
        }, 1500);
    });
    
    // 모달 컨트롤 - 수정된 부분
    if (characterUploadBtn) {
        characterUploadBtn.onclick = function() {
            console.log('캐릭터 업로드 버튼 클릭됨');
            if (characterModal) {
                characterModal.style.display = 'block';
            } else {
                console.error('characterModal 요소를 찾을 수 없습니다.');
            }
        };
    } else {
        console.error('characterUploadBtn 요소를 찾을 수 없습니다.');
    }
    
    if (settingsBtn) {
        settingsBtn.onclick = function() {
            console.log('설정 버튼 클릭됨');
            if (settingsModal) {
                settingsModal.style.display = 'block';
            } else {
                console.error('settingsModal 요소를 찾을 수 없습니다.');
            }
        };
    } else {
        console.error('settingsBtn 요소를 찾을 수 없습니다.');
    }
    
    if (apiConnectionBtn) {
        apiConnectionBtn.onclick = function() {
            console.log('API 연결 버튼 클릭됨');
            if (apiModal) {
                apiModal.style.display = 'block';
            } else {
                console.error('apiModal 요소를 찾을 수 없습니다.');
            }
        };
    } else {
        console.error('apiConnectionBtn 요소를 찾을 수 없습니다.');
    }
    
    // 모달 닫기 버튼
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            console.log('모달 닫기 버튼 클릭됨');
            const modal = this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
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
            const newCharacter = {
                name: name,
                image: e.target.result,
                customDialog: '',
                customGift: '',
                aiCharacterName: ''
            };
            
            characters.push(newCharacter);
            saveToLocalStorage();
            renderSavedCharacters();
            
            // 폼 초기화
            characterNameInput.value = '';
            fileInput.value = '';
            
            // 새 캐릭터를 현재 캐릭터로 설정
            currentCharacter = newCharacter;
            displayCurrentCharacter();
            
            // 초기 스탯 설정
            stats = {
                affection: 50,
                hunger: 50,
                happiness: 50
            };
            updateStatsDisplay();
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
    
    // API 연결 테스트 - 실제 API 연결
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
        
        // Gemini API 엔드포인트
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
        
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
                }]
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('API 요청 실패');
            }
            return response.json();
        })
        .then(data => {
            // API 응답 확인
            if (data.candidates && data.candidates[0].content) {
                connectionStatus.textContent = '연결됨';
                connectionStatus.style.color = 'green';
                testApiBtn.disabled = false;
                apiConnected = true;
            } else {
                throw new Error('API 응답 형식이 올바르지 않습니다');
            }
        })
        .catch(error => {
            connectionStatus.textContent = '연결 실패: 유효하지 않은 API 키';
            connectionStatus.style.color = 'red';
            console.error('API 연결 오류:', error);
        });
    }
    
    // API 연결 버튼
    connectApiBtn.addEventListener('click', () => {
        apiKey = apiKeyInput.value.trim();
        localStorage.setItem('geminiApiKey', apiKey);
        testApiConnection();
    });
    
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
        
        let characterName = currentCharacter ? currentCharacter.name : '다마고치';
        let aiName = currentCharacter && currentCharacter.aiCharacterName ? 
                    currentCharacter.aiCharacterName : characterName;
        
        // Gemini API 호출
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
        
        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `당신은 이제부터 ${aiName}이라는 캐릭터가 되어서 대화해주세요. 사용자 메시지: ${testMessage}`
                    }]
                }]
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('API 요청 실패');
            }
            return response.json();
        })
        .then(data => {
            if (data.candidates && data.candidates[0].content) {
                const aiResponse = data.candidates[0].content.parts[0].text;
                apiResponse.innerHTML = `<p>${aiResponse}</p>`;
            } else {
                apiResponse.innerHTML = '<p>API 응답이 올바른 형식이 아닙니다.</p>';
            }
        })
        .catch(error => {
            apiResponse.innerHTML = `<p>오류 발생: ${error.message}</p>`;
        });
    });
    
    // 창 외부 클릭 시 모달 닫기 (수정된 부분)
    window.onclick = function(event) {
        if (characterModal && event.target === characterModal) {
            characterModal.style.display = 'none';
        }
        if (settingsModal && event.target === settingsModal) {
            settingsModal.style.display = 'none';
        }
        if (apiModal && event.target === apiModal) {
            apiModal.style.display = 'none';
        }
    };
    
    // 초기화
    loadFromLocalStorage();
    displayCurrentCharacter();
    updateStatsDisplay();
});
