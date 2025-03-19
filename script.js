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
    
    // 현재 캐릭터 표시
    function displayCurrentCharacter() {
        if (currentCharacter) {
            characterImage.src = currentCharacter.image;
            noCharacterDisplay.classList.remove('show');
            noCharacterDisplay.classList.add('hide');
            characterContainer.classList.remove('hide');
            characterContainer.classList.add('show');
            
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
    
    // 밤/낮 전환 애니메이션
    function playNightAnimation() {
        // 밤 효과 표시
        nightOverlay.style.opacity = '1';
        
        // 3초 후 밤 효과 숨기기
        setTimeout(() => {
            nightOverlay.style.opacity = '0';
        }, 3000);
    }
    
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
        showSpeechBubble('재미있어요! 더 놀아요!');
        animateCharacter();
    });
    
    giftButton.addEventListener('click', () => {
        if (!currentCharacter) return;
        
        // 스탯 변경
        stats.affection = Math.min(100, stats.affection + 20);
        stats.happiness = Math.min(100, stats.happiness + 15);
        updateStatsDisplay();
        
        // 캐릭터 반응
        let message = '선물이에요? 고마워요!';
        
        if (currentCharacter.customGift) {
            message = `${currentCharacter.customGift}! 정말 좋아해요!`;
        }
        
        showSpeechBubble(message);
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
        }, 3000);
    });
    
    // 모달 컨트롤
    characterUploadBtn.addEventListener('click', () => {
        characterModal.style.display = 'block';
    });
    
    settingsBtn.addEventListener('click', () => {
        settingsModal.style.display = 'block';
    });
    
    apiConnectionBtn.addEventListener('click', () => {
        apiModal.style.display = 'block';
    });
    
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
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
    
    // API 연결 테스트
    function testApiConnection() {
        // 실제 프로덕션에서는 API 키 검증이 필요합니다
        if (apiKey.trim() === '') {
            connectionStatus.textContent = '연결되지 않음';
            connectionStatus.style.color = 'red';
            testApiBtn.disabled = true;
            apiConnected = false;
            return;
        }
        
        // 간단한 테스트를 위해 키 길이만 확인
        if (apiKey.length > 10) {
            connectionStatus.textContent = '연결됨';
            connectionStatus.style.color = 'green';
            testApiBtn.disabled = false;
            apiConnected = true;
        } else {
            connectionStatus.textContent = '유효하지 않은 API 키';
            connectionStatus.style.color = 'red';
            testApiBtn.disabled = true;
            apiConnected = false;
        }
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
        
        // 실제 API 호출 대신 가상의 응답을 생성합니다
        // 실제 구현에서는 Google Gemini API를 호출해야 합니다
        apiResponse.innerHTML = '<p>API 호출 중...</p>';
        
        setTimeout(() => {
            let characterName = currentCharacter ? currentCharacter.name : '다마고치';
            let aiName = currentCharacter && currentCharacter.aiCharacterName ? 
                        currentCharacter.aiCharacterName : characterName;
            
            const responses = [
                `안녕하세요! 저는 ${aiName}이에요. ${testMessage}라고 말씀하셨네요! 오늘 기분이 어떠세요?`,
                `${testMessage}? 그것에 대해 더 이야기해 주세요! 저는 ${aiName}으로서 당신과 대화하는 게 정말 즐거워요!`,
                `${aiName}이(가) 당신의 말을 들었어요: "${testMessage}". 재미있는 이야기네요! 더 알려주세요!`
            ];
            
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            apiResponse.innerHTML = `<p>${randomResponse}</p>`;
            
            // 실제 Gemini API 구현 예시:
            /*
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
            .then(response => response.json())
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
            */
        }, 1000);
    });
    
    // 창 외부 클릭 시 모달 닫기
    window.addEventListener('click', (event) => {
        if (event.target === characterModal) {
            characterModal.style.display = 'none';
        }
        if (event.target === settingsModal) {
            settingsModal.style.display = 'none';
        }
        if (event.target === apiModal) {
            apiModal.style.display = 'none';
        }
    });
    
    // 초기화
    loadFromLocalStorage();
    displayCurrentCharacter();
    updateStatsDisplay();
});
