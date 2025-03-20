document.addEventListener('DOMContentLoaded', function() {
  // 상태 변수
  let stats = {
    affection: 50,
    hunger: 50,
    happiness: 50
  };
  
  // 기본 모델을 'gemini-2.0-flash'로 설정하고 로컬 스토리지에서 불러오기
  let selectedModel = localStorage.getItem('selectedModel') || 'gemini-2.0-flash';
  
  let currentCharacter = null;
  let characters = [];
  let apiKey = '';
  let apiConnected = false;
  let daysCount = 0;
  let characterStats = {}; // 캐릭터별 스탯을 저장하는 객체
  
  // 대화 로그 저장 배열 (최대 10개)
  let dialogLogs = JSON.parse(localStorage.getItem('dialogLogs')) || [];
  
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
  const daysCountDisplay = document.getElementById('days-count');
  const characterStatus = document.getElementById('character-status-text');
  const profileImage = document.getElementById('profile-image');
  const statsResetBtn = document.getElementById('stats-reset-btn');

  // 액션 버튼
  const feedButton = document.getElementById('feed-button');
  const playButton = document.getElementById('play-button');
  const giftButton = document.getElementById('gift-button');
  const sleepButton = document.getElementById('sleep-button');
  const customGiftInput = document.getElementById('custom-gift-input');
  const giveGiftBtn = document.getElementById('give-gift-btn');

  // 컨트롤 버튼
  const characterUploadBtn = document.getElementById('character-upload-btn');
  const settingsBtn = document.getElementById('settings-btn');
  const apiConnectionBtn = document.getElementById('api-connection-btn');
  const profileBtn = document.getElementById('profile-btn');
  const shareBtn = document.getElementById('share-btn');
  const dialogLogsBtn = document.getElementById('dialog-logs-btn'); // 대화 로그 버튼

  // 모달
  const characterModal = document.getElementById('character-modal');
  const settingsModal = document.getElementById('settings-modal');
  const apiModal = document.getElementById('api-modal');
  const profileModal = document.getElementById('profile-modal');
  const shareModal = document.getElementById('share-modal');
  const editCharacterModal = document.getElementById('edit-character-modal');
  const dialogLogsModal = document.getElementById('dialog-logs-modal'); // 대화 로그 모달
  const nightOverlay = document.getElementById('night-overlay');

  // 모달 닫기 버튼
  const closeButtons = document.querySelectorAll('.close');

  // 대화 로그 관련 요소
  const dialogLogsList = document.getElementById('dialog-logs-list');
  
  // 캐릭터 업로드 폼
  const characterNameInput = document.getElementById('character-name');
  const characterImgInput = document.getElementById('character-img');
  const characterTypeExisting = document.getElementById('character-type-existing');
  const characterTypeOriginal = document.getElementById('character-type-original');
  const characterGenreInput = document.getElementById('character-genre');
  const characterToneInput = document.getElementById('character-tone');
  const characterLoreInput = document.getElementById('character-lore');
  const characterPersonalityInput = document.getElementById('character-personality');
  const characterSpeechStyleInput = document.getElementById('character-speech-style');
  const saveCharacterBtn = document.getElementById('save-character');
  const savedCharactersList = document.getElementById('saved-characters-list');
  const editCharacterBtn = document.getElementById('edit-character-btn');

  // 설정 폼
  const currentCharacterName = document.getElementById('current-character-name');
  const customDialogInput = document.getElementById('custom-dialog');
  const customGiftList = document.getElementById('custom-gift');
  const saveSettingsBtn = document.getElementById('save-settings');
  const generateDialogBtn = document.getElementById('generate-dialog-btn');
  const generateGiftsBtn = document.getElementById('generate-gifts-btn');
  const dialogGenerationStatus = document.getElementById('dialog-generation-status');
  const giftGenerationStatus = document.getElementById('gift-generation-status');

  // 캐릭터 수정 폼
  const editCharacterSelect = document.getElementById('edit-character-select');
  const editCharacterForm = document.getElementById('edit-character-form');
  const editCharacterNameInput = document.getElementById('edit-character-name');
  const editCharacterImgInput = document.getElementById('edit-character-img');
  const currentCharacterImg = document.getElementById('current-character-img');
  const editCharacterTypeExisting = document.getElementById('edit-character-type-existing');
  const editCharacterTypeOriginal = document.getElementById('edit-character-type-original');
  const editCharacterGenreInput = document.getElementById('edit-character-genre');
  const editCharacterToneInput = document.getElementById('edit-character-tone');
  const editCharacterLoreInput = document.getElementById('edit-character-lore');
  const editCharacterPersonalityInput = document.getElementById('edit-character-personality');
  const editCharacterSpeechStyleInput = document.getElementById('edit-character-speech-style');
  const updateCharacterBtn = document.getElementById('update-character');

  // API 폼
  const apiKeyInput = document.getElementById('api-key');
  const connectApiBtn = document.getElementById('connect-api');
  const connectionStatus = document.getElementById('connection-status');
  const testMessageInput = document.getElementById('test-message');
  const testApiBtn = document.getElementById('test-api');
  const apiResponse = document.getElementById('api-response');
  const modelFlashRadio = document.getElementById('model-flash');
  const modelProRadio = document.getElementById('model-pro');

  // 프로필 설정
  const profileCharacterName = document.getElementById('profile-character-name');
  const profileImgInput = document.getElementById('profile-img');
  const saveProfileBtn = document.getElementById('save-profile');
  const profilePreviewImg = document.getElementById('profile-preview-img');

  // 이미지 공유
  const createShareImageBtn = document.getElementById('create-share-image');
  const shareImageContainer = document.getElementById('share-image-container');
  const downloadShareImageBtn = document.getElementById('download-share-image');

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

  // 페이지 로드 시 저장된 모델 설정 반영
  function loadSavedModelSelection() {
    if (selectedModel === 'gemini-2.0-flash') {
      modelFlashRadio.checked = true;
    } else {
      modelProRadio.checked = true;
    }
  }

  // 모델 선택 라디오 버튼 이벤트 리스너
  modelFlashRadio.addEventListener('change', function() {
    if (this.checked) {
      selectedModel = 'gemini-2.0-flash';
      localStorage.setItem('selectedModel', selectedModel);
    }
  });

  modelProRadio.addEventListener('change', function() {
    if (this.checked) {
      selectedModel = 'gemini-2.0-pro-exp-02-05';
      localStorage.setItem('selectedModel', selectedModel);
    }
  });

  // 로컬 스토리지에서 데이터 불러오기
  function loadFromLocalStorage() {
    const savedCharacters = localStorage.getItem('tamagotchiCharacters');
    if (savedCharacters) {
      characters = JSON.parse(savedCharacters);
      renderSavedCharacters();
      populateEditCharacterSelect();
    }

    const savedCharacterStats = localStorage.getItem('tamagotchiCharacterStats');
    if (savedCharacterStats) {
      characterStats = JSON.parse(savedCharacterStats);
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

    const savedDaysCount = localStorage.getItem('tamagotchiDaysCount');
    if (savedDaysCount) {
      daysCount = parseInt(savedDaysCount);
      daysCountDisplay.textContent = daysCount;
    }
    
    // 저장된 모델 설정 불러오기
    loadSavedModelSelection();
    
    // 대화 로그 불러오기
    const savedDialogLogs = localStorage.getItem('dialogLogs');
    if (savedDialogLogs) {
      dialogLogs = JSON.parse(savedDialogLogs);
    }
    renderDialogLogs();
  }

  // 로컬 스토리지에 데이터 저장
  function saveToLocalStorage() {
    localStorage.setItem('tamagotchiCharacters', JSON.stringify(characters));
    localStorage.setItem('tamagotchiCharacterStats', JSON.stringify(characterStats));
    localStorage.setItem('tamagotchiStats', JSON.stringify(stats));
    localStorage.setItem('tamagotchiDaysCount', daysCount.toString());
    localStorage.setItem('dialogLogs', JSON.stringify(dialogLogs));
    
    if (currentCharacter) {
      localStorage.setItem('currentCharacter', JSON.stringify(currentCharacter));
    }
    
    if (apiKey) {
      localStorage.setItem('geminiApiKey', apiKey);
    }
  }

  // 대화 로그에 추가
  function addToDialogLogs(dialog, action) {
    if (!dialog || dialog.trim() === '') return;
    
    // 최대 10개만 저장
    if (dialogLogs.length >= 10) {
      dialogLogs.pop(); // 가장 오래된 로그 제거
    }
    
    // 새 로그 추가 (맨 앞에)
    dialogLogs.unshift({
      text: dialog,
      action: action,
      timestamp: new Date().toLocaleString(),
      character: currentCharacter ? currentCharacter.name : '캐릭터'
    });
    
    // 로컬 스토리지에 저장
    localStorage.setItem('dialogLogs', JSON.stringify(dialogLogs));
    
    // 대화 로그 목록 갱신
    renderDialogLogs();
  }

  // 대화 로그 목록 렌더링
  function renderDialogLogs() {
    if (!dialogLogsList) return;
    
    dialogLogsList.innerHTML = '';
    
    if (dialogLogs.length === 0) {
      const emptyItem = document.createElement('div');
      emptyItem.className = 'empty-logs';
      emptyItem.textContent = '저장된 대화 로그가 없습니다.';
      dialogLogsList.appendChild(emptyItem);
      return;
    }
    
    dialogLogs.forEach((log, index) => {
      const logItem = document.createElement('div');
      logItem.className = 'dialog-log-item';
      
      const logText = document.createElement('div');
      logText.className = 'dialog-log-text';
      logText.textContent = log.text;
      
      const logInfo = document.createElement('div');
      logInfo.className = 'dialog-log-info';
      logInfo.textContent = `${log.character} - ${log.action} [${log.timestamp}]`;
      
      const logActions = document.createElement('div');
      logActions.className = 'dialog-log-actions';
      
      const copyBtn = document.createElement('button');
      copyBtn.className = 'log-action-btn';
      copyBtn.textContent = '복사';
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(log.text)
          .then(() => {
            copyBtn.textContent = '복사됨!';
            setTimeout(() => {
              copyBtn.textContent = '복사';
            }, 2000);
          })
          .catch(err => {
            console.error('클립보드 복사 실패:', err);
          });
      });
      
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'log-action-btn delete-btn';
      deleteBtn.textContent = '삭제';
      deleteBtn.addEventListener('click', () => {
        dialogLogs.splice(index, 1);
        localStorage.setItem('dialogLogs', JSON.stringify(dialogLogs));
        renderDialogLogs();
      });
      
      logActions.appendChild(copyBtn);
      logActions.appendChild(deleteBtn);
      
      logItem.appendChild(logText);
      logItem.appendChild(logInfo);
      logItem.appendChild(logActions);
      
      dialogLogsList.appendChild(logItem);
    });
  }

  // 스탯 표시 업데이트
  function updateStatsDisplay() {
    affectionBar.style.width = `${stats.affection}%`;
    hungerBar.style.width = `${stats.hunger}%`;
    happinessBar.style.width = `${stats.happiness}%`;
    
    affectionValue.textContent = Math.round(stats.affection);
    hungerValue.textContent = Math.round(stats.hunger);
    happinessValue.textContent = Math.round(stats.happiness);
    
    // 현재 캐릭터의 스탯 저장
    if (currentCharacter) {
      characterStats[currentCharacter.name] = { ...stats };
    }
    
    saveToLocalStorage();
    updateCharacterStatus();
  }

  // 캐릭터 상태 업데이트
  function updateCharacterStatus() {
    if (!currentCharacter) return;
    
    let status = "기본 상태";
    
    if (stats.hunger < 20) {
      status = "배고픔";
    } else if (stats.happiness < 20) {
      status = "우울함";
    } else if (stats.affection < 20) {
      status = "외로움";
    } else if (stats.hunger > 80 && stats.happiness > 80 && stats.affection > 80) {
      status = "최상의 상태";
    } else if (stats.hunger > 60 && stats.happiness > 60 && stats.affection > 60) {
      status = "행복한 상태";
    }
    
    characterStatus.textContent = status;
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
      
      // 프로필 이미지 설정
      if (currentCharacter.profileImage) {
        profileImage.src = currentCharacter.profileImage;
      } else {
        profileImage.src = currentCharacter.image;
      }
      
      // 게임 타이틀 업데이트
      updateGameTitle();
      
      // 현재 캐릭터 이름 설정 창에 표시
      currentCharacterName.textContent = currentCharacter.name;
      profileCharacterName.textContent = currentCharacter.name;
      profilePreviewImg.src = currentCharacter.profileImage || currentCharacter.image;
      
      // 설정 로드
      if (currentCharacter.customDialog) {
        customDialogInput.value = currentCharacter.customDialog;
      } else {
        customDialogInput.value = '';
      }
      
      if (currentCharacter.customGift) {
        customGiftList.value = currentCharacter.customGift;
      } else {
        customGiftList.value = '';
      }
      
      // 캐릭터별 스탯 로드
      if (characterStats[currentCharacter.name]) {
        stats = { ...characterStats[currentCharacter.name] };
        updateStatsDisplay();
      }
      
      // 좋아하는 선물 목록 표시
      renderFavoriteGifts();
      
      // AI를 통한 인사말 생성
      if (apiConnected) {
        generateGreeting();
      } else {
        showSpeechBubble(`안녕하세요! 저는 ${currentCharacter.name}이에요!`);
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
      customGiftList.value = '';
      profilePreviewImg.src = '';
    }
  }

  // AI를 통한 인사말 생성
  function generateGreeting() {
    if (!apiConnected || !currentCharacter) return;
    
    const prompt = createCharacterPrompt("처음 만났을 때", "사용자와 처음 만나서 인사를 합니다.");
    
    callGeminiAPI(prompt)
      .then(response => {
        showSpeechBubble(response);
        addToDialogLogs(response, "인사"); // 대화 로그에 저장
      })
      .catch(error => {
        console.error("AI 인사말 생성 오류:", error);
        showSpeechBubble(`안녕하세요! 저는 ${currentCharacter.name}이에요!`);
      });
  }

  // 말풍선 표시
  function showSpeechBubble(text) {
    characterSpeech.textContent = text;
    speechBubble.classList.remove('hide');
    
    // 5초 후 말풍선 숨기기
    setTimeout(() => {
      speechBubble.classList.add('hide');
    }, 5000);
  }

  // 좋아하는 선물 목록 표시
  function renderFavoriteGifts() {
    const favoriteGiftsList = document.getElementById('favorite-gifts-list');
    favoriteGiftsList.innerHTML = '';
    
    if (!currentCharacter || !currentCharacter.customGift) return;
    
    const gifts = currentCharacter.customGift.split(',').map(gift => gift.trim());
    
    gifts.forEach(gift => {
      if (gift === '') return;
      
      const giftTag = document.createElement('div');
      giftTag.className = 'gift-tag';
      giftTag.textContent = gift;
      
      giftTag.addEventListener('click', () => {
        customGiftInput.value = gift;
      });
      
      favoriteGiftsList.appendChild(giftTag);
    });
  }

  // 저장된 캐릭터 목록 렌더링
  function renderSavedCharacters() {
    savedCharactersList.innerHTML = '';
    
    characters.forEach((char, index) => {
      const characterCard = document.createElement('div');
      characterCard.className = 'character-card';
      
      const img = document.createElement('img');
      img.src = char.image;
      img.alt = char.name;
      
      const name = document.createElement('p');
      name.textContent = char.name;
      
      characterCard.appendChild(img);
      characterCard.appendChild(name);
      
      characterCard.addEventListener('click', () => {
        loadCharacter(index);
        characterModal.style.display = 'none';
      });
      
      savedCharactersList.appendChild(characterCard);
    });
  }

  // 수정할 캐릭터 선택 드롭다운 채우기
  function populateEditCharacterSelect() {
    editCharacterSelect.innerHTML = '';
    
    characters.forEach((char, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = char.name;
      editCharacterSelect.appendChild(option);
    });
  }

  // 캐릭터 로드
  function loadCharacter(index) {
    currentCharacter = characters[index];
    
    // 캐릭터별 스탯 로드
    if (characterStats[currentCharacter.name]) {
      stats = { ...characterStats[currentCharacter.name] };
    } else {
      // 스탯이 없으면 기본값으로 설정
      stats = { affection: 50, hunger: 50, happiness: 50 };
      characterStats[currentCharacter.name] = { ...stats };
    }
    
    displayCurrentCharacter();
    updateStatsDisplay();
    
    // 만난 날짜 증가
    daysCount++;
    daysCountDisplay.textContent = daysCount;
    
    saveToLocalStorage();
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

  // 캐릭터 프롬프트 생성 
  function createCharacterPrompt(action, additionalContext = '') {
    if (!currentCharacter) return "";
    
    let prompt = `당신은 이제부터 '${currentCharacter.name}'이라는 캐릭터가 되어 응답해주세요. 다음 캐릭터 정보를 바탕으로 성격과 말투를 완벽히 재현해 주세요.\n\n`;
    
    // 캐릭터 기본 정보 추가
    if (currentCharacter.type === 'existing') {
      prompt += `캐릭터 유형: 기존 작품의 캐릭터\n`;
    } else {
      prompt += `캐릭터 유형: 오리지널 캐릭터\n`;
    }
    
    if (currentCharacter.genre) {
      prompt += `장르: ${currentCharacter.genre}\n`;
    }
    if (currentCharacter.tone) {
      prompt += `말투: ${currentCharacter.tone}\n`;
    }
    if (currentCharacter.lore) {
      prompt += `세계관: ${currentCharacter.lore}\n`;
    }
    if (currentCharacter.personality) {
      prompt += `성격: ${currentCharacter.personality}\n`;
    }
    if (currentCharacter.speechStyle) {
      prompt += `말투 특징: ${currentCharacter.speechStyle}\n`;
    }
    
    // 현재 캐릭터 상태 정보 추가
    prompt += `\n현재 캐릭터 상태:
- 호감도: ${stats.affection}/100 (${stats.affection < 30 ? '매우 낮음' : stats.affection < 60 ? '보통' : '높음'})
- 허기: ${stats.hunger}/100 (${stats.hunger < 30 ? '매우 배고픔' : stats.hunger < 60 ? '약간 배고픔' : '배부름'})
- 행복도: ${stats.happiness}/100 (${stats.happiness < 30 ? '우울함' : stats.happiness < 60 ? '보통' : '행복함'})\n`;

    // 상황별 추가 컨텍스트 제공
    prompt += `\n현재 상황: 사용자가 ${action}을(를) 했습니다. ${additionalContext}\n`;
    
    // 응답 요청 사항
    prompt += `\n${currentCharacter.name}의 반응을 다음 지침에 맞게 생성해주세요:
1. 캐릭터의 성격, 말투, 현재 상태를 정확히 반영할 것
2. 매번 다른 느낌의 대사를 생성할 것 (문장 구조와 어투를 다양하게 변화시킬 것)
3. 상황과 감정을 생생하게 표현할 것
4. 정형화된 문장이나 패턴을 반복하지 말 것
5. 현재 상태(호감도, 허기, 행복도)에 적합한 감정 상태를 반영할 것
6. 한 문장에서 세 문장 사이로 간결하게 응답할 것

캐릭터의 대사만 작성하고, 다른 설명은 포함하지 마세요.`;
    
    return prompt;
  }

  // Gemini API 호출 함수
  async function callGeminiAPI(prompt) {
    if (!apiConnected || !apiKey) {
      throw new Error("API가 연결되지 않았습니다.");
    }
    
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`;
    console.log(`선택된 모델로 API 호출: ${selectedModel}`);
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.9, // 답변 다양성 증가
            maxOutputTokens: 150 // 답변 길이 제한
          }
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API 요청 실패: ${errorData.error?.message || '알 수 없는 오류'}`);
      }
      
      const data = await response.json();
      console.log("API 응답 수신:", data);
      
      if (data.candidates && data.candidates[0].content) {
        // 줄바꿈 문자를 공백으로 변경하여 반환
        let responseText = data.candidates[0].content.parts[0].text;
        responseText = responseText.replace(/\n/g, ' ');
        return responseText;
      } else {
        throw new Error('API 응답 형식이 올바르지 않습니다');
      }
    } catch (error) {
      console.error("API 호출 오류:", error);
      throw error;
    }
  }

  // 대화 자동 생성
  async function generateDialogs() {
    if (!apiConnected || !currentCharacter) {
      alert("API가 연결되지 않았거나 캐릭터가 선택되지 않았습니다.");
      return;
    }
    
    dialogGenerationStatus.textContent = "생성 중...";
    
    try {
      const prompt = 
      `당신은 이제부터 '${currentCharacter.name}'이라는 캐릭터의 대화를 생성해주세요. 캐릭터 정보:
${currentCharacter.type === 'existing' ? '기존 작품 캐릭터' : '오리지널 캐릭터'}
${currentCharacter.genre ? '장르: ' + currentCharacter.genre : ''}
${currentCharacter.tone ? '말투: ' + currentCharacter.tone : ''}
${currentCharacter.lore ? '세계관: ' + currentCharacter.lore : ''}
${currentCharacter.personality ? '성격: ' + currentCharacter.personality : ''}
${currentCharacter.speechStyle ? '말투 특징: ' + currentCharacter.speechStyle : ''}

다음 지침에 따라 이 캐릭터의 다양한 대화 문장을 7개 생성해주세요:
1. 각 문장은 캐릭터의 개성이 뚜렷하게 드러나야 함
2. 다양한 상황과 감정을 표현하는 대화를 포함할 것
3. 문장 구조와 어미를 다양하게 변화시킬 것
4. 캐릭터의 특징적인 말투를 자연스럽게 반영할 것
5. 고정된 형식이나 반복되는 패턴을 피할 것

대화 문장만 쉼표(,)로 구분하여 나열해주세요. 다른 설명은 포함하지 마세요.`;

      const response = await callGeminiAPI(prompt);
      
      // 응답을 처리하여 대화만 추출
      let dialogs = response.replace(/^\d+\.\s*/gm, '').trim();
      
      // 줄바꿈을 쉼표로 변환
      dialogs = dialogs.replace(/\n/g, ', ').replace(/,,/g, ',');
      
      customDialogInput.value = dialogs;
      dialogGenerationStatus.textContent = "생성 완료!";
      
      setTimeout(() => {
        dialogGenerationStatus.textContent = "";
      }, 3000);
    } catch (error) {
      dialogGenerationStatus.textContent = `오류: ${error.message}`;
      console.error("대화 생성 오류:", error);
    }
  }

  // 선물 자동 생성
  async function generateGifts() {
    if (!apiConnected || !currentCharacter) {
      alert("API가 연결되지 않았거나 캐릭터가 선택되지 않았습니다.");
      return;
    }
    
    giftGenerationStatus.textContent = "생성 중...";
    
    try {
      const prompt = 
      `당신은 이제부터 '${currentCharacter.name}'이라는 캐릭터가 좋아할 만한 선물 목록을 생성해주세요. 캐릭터 정보:
${currentCharacter.type === 'existing' ? '기존 작품 캐릭터' : '오리지널 캐릭터'}
${currentCharacter.genre ? '장르: ' + currentCharacter.genre : ''}
${currentCharacter.personality ? '성격: ' + currentCharacter.personality : ''}
${currentCharacter.lore ? '세계관: ' + currentCharacter.lore : ''}

다음 지침에 따라 이 캐릭터의 취향에 맞는 다양한 선물을 7개 생성해주세요:
1. 캐릭터의 성격과 취향을 반영하는 독특한 선물을 포함할 것
2. 장르와 세계관에 어울리는 선물을 포함할 것
3. 평범한 선물과 특별한 선물을 적절히 섞을 것
4. 구체적인 아이템 이름을 사용할 것 (예: '책' 대신 '판타지 모험 소설')

선물 이름만 쉼표(,)로 구분하여 나열해주세요. 다른 설명은 포함하지 마세요.`;

      const response = await callGeminiAPI(prompt);
      
      // 응답을 처리하여 선물만 추출
      let gifts = response.replace(/^\d+\.\s*/gm, '').trim();
      
      // 줄바꿈을 쉼표로 변환
      gifts = gifts.replace(/\n/g, ', ').replace(/,,/g, ',');
      
      customGiftList.value = gifts;
      giftGenerationStatus.textContent = "생성 완료!";
      
      setTimeout(() => {
        giftGenerationStatus.textContent = "";
      }, 3000);
    } catch (error) {
      giftGenerationStatus.textContent = `오류: ${error.message}`;
      console.error("선물 생성 오류:", error);
    }
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

  // AI 기반 반응 생성
  async function generateAIResponse(action, additionalContext = '') {
    console.log(`${action} 액션에 대한 AI 응답 생성 시작`);
    
    if (!apiConnected || !currentCharacter) {
      console.log("API 연결되지 않았거나 캐릭터가 선택되지 않음");
      return null;
    }
    
    let prompt = "";
    
    switch (action) {
      case "feed":
        const hungerStatus = stats.hunger < 30 ? "매우 배고픈 상태에서 " : 
                            stats.hunger > 80 ? "이미 배부른 상태에서 " : "";
        prompt = createCharacterPrompt("밥을 줬을 때", `${hungerStatus}밥을 받았습니다.`);
        break;
        
      case "play":
        const happinessStatus = stats.happiness < 30 ? "매우 우울한 상태에서 " : 
                              stats.happiness > 80 ? "이미 매우 행복한 상태에서 " : "";
        prompt = createCharacterPrompt("같이 놀아줬을 때", `${happinessStatus}사용자가 놀아주었습니다.`);
        break;
        
      case "gift":
        const gift = getRandomGift();
        console.log(`선물 주기: 선택된 선물 - ${gift}`);
        const affectionStatus = stats.affection < 30 ? "호감도가 낮은 상태에서 " : 
                              stats.affection > 80 ? "이미 호감도가 높은 상태에서 " : "";
        prompt = createCharacterPrompt(`'${gift}'라는 선물을 줬을 때`, `${affectionStatus}마음에 들어할 만한 '${gift}'를 선물 받았습니다.`);
        break;
        
      case "sleep":
        const sleepStatus = stats.hunger < 30 ? "배고픈 상태에서 " : 
                          stats.hunger > 80 && stats.happiness > 60 ? "배부르고 행복한 상태에서 " : "";
        prompt = createCharacterPrompt("잠자리에 들었을 때", `${sleepStatus}잠이 들었다가 아침에 일어났습니다.`);
        break;
        
      case "customGift":
        const customGift = customGiftInput.value.trim();
        console.log(`커스텀 선물 주기: ${customGift}`);
        if (customGift) {
          const likeStatus = currentCharacter.customGift && currentCharacter.customGift.includes(customGift) ? 
                          "좋아하는 " : "처음 받아보는 ";
          prompt = createCharacterPrompt(`'${customGift}'라는 선물을 줬을 때`, `${likeStatus}'${customGift}'를 선물 받았습니다.`);
        } else {
          prompt = createCharacterPrompt("선물을 줬을 때", "어떤 선물인지 정확히 알 수 없는 선물을 받았습니다.");
        }
        break;
        
      case "click":
        prompt = createCharacterPrompt("캐릭터를 클릭했을 때", "사용자가 갑자기 자신을 건드렸습니다.");
        break;
        
      default:
        if (additionalContext) {
          prompt = createCharacterPrompt(action, additionalContext);
        } else {
          console.log(`알 수 없는 액션: ${action}`);
          return null;
        }
    }
    
    try {
      console.log(`${action} 액션 프롬프트 생성 완료, API 호출 시작`);
      const response = await callGeminiAPI(prompt);
      console.log(`${action} 액션에 대한 AI 응답 수신 성공`);
      return response;
    } catch (error) {
      console.error(`AI 응답 생성 오류 (${action}):`, error);
      return null;
    }
  }

  // 캐릭터 이미지 클릭 이벤트
  characterImage.addEventListener('click', async () => {
    if (!currentCharacter) return;
    
    // 애니메이션 실행
    animateCharacter();
    
    // AI 응답 생성 시도
    try {
      if (apiConnected) {
        console.log("캐릭터 클릭: AI 응답 요청 시작");
        const aiResponse = await generateAIResponse("click");
        if (aiResponse) {
          showSpeechBubble(aiResponse);
          addToDialogLogs(aiResponse, "클릭");
          return;
        }
      }
    } catch (error) {
      console.error("캐릭터 클릭 이벤트 오류:", error);
    }
    
    // API 연결 실패 시 기본 응답 사용
    const defaultResponse = getRandomDialog();
    showSpeechBubble(defaultResponse);
    addToDialogLogs(defaultResponse, "클릭");
  });

  // 액션 버튼 이벤트 - 수정된 부분
  feedButton.addEventListener('click', async () => {
    if (!currentCharacter) return;
    
    console.log("밥주기 버튼 클릭됨");
    
    // 스탯 변경
    stats.hunger = Math.min(100, stats.hunger + 20);
    stats.happiness = Math.min(100, stats.happiness + 5);
    updateStatsDisplay();
    
    // 애니메이션 실행
    animateCharacter();
    
    // AI 응답 생성 시도
    try {
      if (apiConnected) {
        console.log("밥주기: AI 응답 요청 시작");
        const aiResponse = await generateAIResponse("feed");
        console.log("밥주기: AI 응답 결과:", aiResponse);
        
        if (aiResponse) {
          showSpeechBubble(aiResponse);
          addToDialogLogs(aiResponse, "밥주기");
          return;
        }
      }
    } catch (error) {
      console.error("밥주기 이벤트 오류:", error);
    }
    
    // API 연결 실패 시 기본 응답 사용
    const hungerLevel = stats.hunger;
    let response;
    
    if (hungerLevel < 30) {
      response = '와, 정말 배고팠어요! 감사합니다!';
    } else if (hungerLevel > 80) {
      response = '으, 배가 너무 불러요... 그래도 고마워요.';
    } else {
      response = '맛있어요! 감사합니다!';
    }
    
    showSpeechBubble(response);
    addToDialogLogs(response, "밥주기");
  });

  playButton.addEventListener('click', async () => {
    if (!currentCharacter) return;
    
    console.log("놀아주기 버튼 클릭됨");
    
    // 스탯 변경
    stats.happiness = Math.min(100, stats.happiness + 20);
    stats.affection = Math.min(100, stats.affection + 10);
    stats.hunger = Math.max(0, stats.hunger - 5);
    updateStatsDisplay();
    
    // 애니메이션 실행
    animateCharacter();
    
    // AI 응답 생성 시도
    try {
      if (apiConnected) {
        console.log("놀아주기: AI 응답 요청 시작");
        const aiResponse = await generateAIResponse("play");
        console.log("놀아주기: AI 응답 결과:", aiResponse);
        
        if (aiResponse) {
          showSpeechBubble(aiResponse);
          addToDialogLogs(aiResponse, "놀아주기");
          return;
        }
      }
    } catch (error) {
      console.error("놀아주기 이벤트 오류:", error);
    }
    
    // API 연결 실패 시 기본 응답 사용
    const defaultResponse = getRandomDialog();
    showSpeechBubble(defaultResponse);
    addToDialogLogs(defaultResponse, "놀아주기");
  });

  giftButton.addEventListener('click', async () => {
    if (!currentCharacter) return;
    
    console.log("선물주기 버튼 클릭됨");
    
    // 스탯 변경
    stats.affection = Math.min(100, stats.affection + 20);
    stats.happiness = Math.min(100, stats.happiness + 15);
    updateStatsDisplay();
    
    // 선물 선택
    const gift = getRandomGift();
    console.log(`선택된 랜덤 선물: ${gift}`);
    
    // 애니메이션 실행
    animateCharacter();
    
    // AI 응답 생성 시도
    try {
      if (apiConnected) {
        console.log("선물주기: AI 응답 요청 시작");
        const aiResponse = await generateAIResponse("gift");
        console.log("선물주기: AI 응답 결과:", aiResponse);
        
        if (aiResponse) {
          showSpeechBubble(aiResponse);
          addToDialogLogs(aiResponse, "선물주기 (" + gift + ")");
          return;
        }
      }
    } catch (error) {
      console.error("선물주기 이벤트 오류:", error);
    }
    
    // API 연결 실패 시 기본 응답 사용
    const response = `${gift}! 정말 좋아해요!`;
    showSpeechBubble(response);
    addToDialogLogs(response, "선물주기 (" + gift + ")");
  });

  sleepButton.addEventListener('click', async () => {
    if (!currentCharacter) return;
    
    console.log("잠자기 버튼 클릭됨");
    
    // 밤/낮 전환 애니메이션
    playNightAnimation();
    
    // AI 응답 생성 시도
    let aiResponse = null;
    try {
      if (apiConnected) {
        console.log("잠자기: AI 응답 요청 시작");
        aiResponse = await generateAIResponse("sleep");
        console.log("잠자기: AI 응답 결과:", aiResponse);
      }
    } catch (error) {
      console.error("잠자기 이벤트 오류:", error);
    }
    
    // 시간이 지남에 따른 스탯 변화
    setTimeout(() => {
      // 수면 중 허기 감소
      stats.hunger = Math.max(0, stats.hunger - 30);
      
      // 수면에 따른 호감도와 행복도 변화
      if (stats.hunger < 20) {
        // 배고프면 행복도와 호감도 감소
        stats.happiness = Math.max(0, stats.happiness - 25);
        stats.affection = Math.max(0, stats.affection - 15);
        
        if (aiResponse) {
          showSpeechBubble(aiResponse);
          addToDialogLogs(aiResponse, "잠자기");
        } else {
          const response = '배고파요... 밥 주세요ㅠㅠ';
          showSpeechBubble(response);
          addToDialogLogs(response, "잠자기");
        }
      } else {
        // 배부르면 행복도와 호감도 증가
        stats.happiness = Math.min(100, stats.happiness + 15);
        stats.affection = Math.min(100, stats.affection + 10);
        
        if (aiResponse) {
          showSpeechBubble(aiResponse);
          addToDialogLogs(aiResponse, "잠자기");
        } else {
          const response = '잘 잤어요! 기분이 좋아요!';
          showSpeechBubble(response);
          addToDialogLogs(response, "잠자기");
        }
      }
      
      updateStatsDisplay();
    }, 1500);
  });

  // 직접 선물 주기 버튼
  giveGiftBtn.addEventListener('click', async () => {
    if (!currentCharacter) return;
    
    console.log("커스텀 선물주기 버튼 클릭됨");
    
    const customGift = customGiftInput.value.trim();
    
    if (customGift === '') {
      alert('선물 이름을 입력해주세요.');
      return;
    }
    
    console.log(`입력된 커스텀 선물: ${customGift}`);
    
    // 스탯 변경
    stats.affection = Math.min(100, stats.affection + 15);
    stats.happiness = Math.min(100, stats.happiness + 10);
    updateStatsDisplay();
    
    // 애니메이션 실행
    animateCharacter();
    
    // AI 응답 생성 시도
    try {
      if (apiConnected) {
        console.log("커스텀 선물주기: AI 응답 요청 시작");
        const aiResponse = await generateAIResponse("customGift");
        console.log("커스텀 선물주기: AI 응답 결과:", aiResponse);
        
        if (aiResponse) {
          showSpeechBubble(aiResponse);
          addToDialogLogs(aiResponse, "선물주기 (" + customGift + ")");
          customGiftInput.value = '';
          return;
        }
      }
    } catch (error) {
      console.error("커스텀 선물주기 이벤트 오류:", error);
    }
    
    // API 연결 실패 시 기본 응답 사용
    const response = `${customGift}! 정말 좋아해요!`;
    showSpeechBubble(response);
    addToDialogLogs(response, "선물주기 (" + customGift + ")");
    
    // 입력 필드 초기화
    customGiftInput.value = '';
  });

  // 스탯 리셋 버튼
  statsResetBtn.addEventListener('click', () => {
    if (!currentCharacter) return;
    
    if (confirm('정말 스탯을 초기화하시겠습니까?')) {
      stats = { affection: 50, hunger: 50, happiness: 50 };
      
      if (currentCharacter) {
        characterStats[currentCharacter.name] = { ...stats };
      }
      
      updateStatsDisplay();
      showSpeechBubble('스탯이 초기화되었어요!');
    }
  });

  // 모달 컨트롤
  characterUploadBtn.onclick = function() {
    characterModal.style.display = 'block';
  };
  
  settingsBtn.onclick = function() {
    settingsModal.style.display = 'block';
  };
  
  apiConnectionBtn.onclick = function() {
    apiModal.style.display = 'block';
  };
  
  profileBtn.onclick = function() {
    profileModal.style.display = 'block';
  };
  
  shareBtn.onclick = function() {
    shareModal.style.display = 'block';
  };
  
  // 대화 로그 버튼 이벤트 리스너 추가
  if (dialogLogsBtn) {
    dialogLogsBtn.onclick = function() {
      console.log("대화 로그 버튼 클릭됨");
      if (dialogLogsModal) {
        dialogLogsModal.style.display = 'block';
        renderDialogLogs(); // 최신 로그 표시
      } else {
        console.error("대화 로그 모달이 존재하지 않습니다.");
      }
    };
  }
  
  editCharacterBtn.onclick = function() {
    populateEditCharacterSelect();
    editCharacterModal.style.display = 'block';
  };

  // 모달 닫기 버튼
  closeButtons.forEach(button => {
    button.addEventListener('click', function() {
      const modal = this.closest('.modal');
      if (modal) {
        modal.style.display = 'none';
      }
    });
  });

  // 수정할 캐릭터 선택 시 폼 채우기
  editCharacterSelect.addEventListener('change', function() {
    const selectedIndex = this.value;
    
    if (selectedIndex === "") {
      editCharacterForm.style.display = 'none';
      return;
    }
    
    const selectedCharacter = characters[selectedIndex];
    
    editCharacterNameInput.value = selectedCharacter.name;
    currentCharacterImg.src = selectedCharacter.image;
    
    if (selectedCharacter.type === 'existing') {
      editCharacterTypeExisting.checked = true;
    } else {
      editCharacterTypeOriginal.checked = true;
    }
    
    editCharacterGenreInput.value = selectedCharacter.genre || '';
    editCharacterToneInput.value = selectedCharacter.tone || '';
    editCharacterLoreInput.value = selectedCharacter.lore || '';
    editCharacterPersonalityInput.value = selectedCharacter.personality || '';
    editCharacterSpeechStyleInput.value = selectedCharacter.speechStyle || '';
    
    editCharacterForm.style.display = 'block';
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
        type: characterTypeExisting.checked ? 'existing' : 'original',
        genre: characterGenreInput.value.trim(),
        tone: characterToneInput.value.trim(),
        lore: characterLoreInput.value.trim(),
        personality: characterPersonalityInput.value.trim(),
        speechStyle: characterSpeechStyleInput.value.trim(),
        customDialog: '',
        customGift: ''
      };
      
      characters.push(newCharacter);
      saveToLocalStorage();
      renderSavedCharacters();
      populateEditCharacterSelect();
      
      // 폼 초기화
      characterNameInput.value = '';
      fileInput.value = '';
      characterGenreInput.value = '';
      characterToneInput.value = '';
      characterLoreInput.value = '';
      characterPersonalityInput.value = '';
      characterSpeechStyleInput.value = '';
      
      // 새 캐릭터를 현재 캐릭터로 설정
      currentCharacter = newCharacter;
      displayCurrentCharacter();
    };
    
    reader.readAsDataURL(file);
  });

  // 캐릭터 수정
  updateCharacterBtn.addEventListener('click', () => {
    const selectedIndex = editCharacterSelect.value;
    
    if (selectedIndex === "") {
      alert('수정할 캐릭터를 선택해주세요.');
      return;
    }
    
    const index = parseInt(selectedIndex);
    const name = editCharacterNameInput.value.trim();
    
    if (name === '') {
      alert('캐릭터 이름은 필수입니다.');
      return;
    }
    
    const updatedCharacter = {
      ...characters[index],
      name: name,
      type: editCharacterTypeExisting.checked ? 'existing' : 'original',
      genre: editCharacterGenreInput.value.trim(),
      tone: editCharacterToneInput.value.trim(),
      lore: editCharacterLoreInput.value.trim(),
      personality: editCharacterPersonalityInput.value.trim(),
      speechStyle: editCharacterSpeechStyleInput.value.trim()
    };
    
    const fileInput = editCharacterImgInput;
    
    if (fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      const reader = new FileReader();
      
      reader.onload = function(e) {
        updatedCharacter.image = e.target.result;
        finalizeCharacterUpdate(index, updatedCharacter);
      };
      
      reader.readAsDataURL(file);
    } else {
      // 이미지 변경 없이 업데이트
      finalizeCharacterUpdate(index, updatedCharacter);
    }
  });

  function finalizeCharacterUpdate(index, updatedCharacter) {
    // 캐릭터 이름 변경 시 스탯도 함께 업데이트
    if (characters[index].name !== updatedCharacter.name) {
      if (characterStats[characters[index].name]) {
        characterStats[updatedCharacter.name] = { ...characterStats[characters[index].name] };
        delete characterStats[characters[index].name];
      }
    }
    
    // 현재 캐릭터가 수정한 캐릭터인 경우 업데이트
    if (currentCharacter && currentCharacter.name === characters[index].name) {
      currentCharacter = updatedCharacter;
    }
    
    characters[index] = updatedCharacter;
    saveToLocalStorage();
    renderSavedCharacters();
    populateEditCharacterSelect();
    
    if (currentCharacter && currentCharacter.name === updatedCharacter.name) {
      displayCurrentCharacter();
    }
    
    editCharacterModal.style.display = 'none';
    alert('캐릭터가 성공적으로 수정되었습니다.');
  }

  // 설정 저장
  saveSettingsBtn.addEventListener('click', () => {
    if (!currentCharacter) {
      alert('먼저 캐릭터를 선택해주세요.');
      return;
    }
    
    // 현재 캐릭터의 설정 업데이트
    currentCharacter.customDialog = customDialogInput.value.trim();
    currentCharacter.customGift = customGiftList.value.trim();
    
    // characters 배열에서 현재 캐릭터 업데이트
    const index = characters.findIndex(char => char.name === currentCharacter.name);
    
    if (index !== -1) {
      characters[index] = currentCharacter;
    }
    
    saveToLocalStorage();
    renderFavoriteGifts();
    settingsModal.style.display = 'none';
    
    // 저장 완료 메시지
    showSpeechBubble('설정이 저장되었어요!');
  });

  // API 연결 테스트
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
    
    // Gemini API 엔드포인트 (선택된 모델 사용)
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`;
    
    console.log(`선택된 모델: ${selectedModel}`); // 디버깅용
    
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
    
    // Gemini API 호출 (선택된 모델 사용)
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`;
    
    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `당신은 이제부터 ${characterName}이라는 캐릭터가 되어서 대화해주세요. 사용자 메시지: ${testMessage}`
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
        return response.json().then(errorData => {
          throw new Error(`API 요청 실패: ${errorData.error?.message || '알 수 없는 오류'}`);
        });
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

  // 맞춤 대화 자동 생성 버튼
  generateDialogBtn.addEventListener('click', () => {
    generateDialogs();
  });

  // 맞춤 선물 자동 생성 버튼
  generateGiftsBtn.addEventListener('click', () => {
    generateGifts();
  });

  // 창 외부 클릭 시 모달 닫기
  window.onclick = function(event) {
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
    if (event.target === editCharacterModal) {
      editCharacterModal.style.display = 'none';
    }
    if (event.target === dialogLogsModal) {
      dialogLogsModal.style.display = 'none';
    }
  };

  // 초기화
  loadFromLocalStorage();
  displayCurrentCharacter();
  updateStatsDisplay();
});
