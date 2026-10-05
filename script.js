/**
 * img2pdf - 클라이언트 전용 Image to PDF 변환기
 * 순수 Vanilla JavaScript (ES6+), jsPDF, Sortable.js 활용
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM 요소 참조
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileInput');
  const toolbar = document.getElementById('toolbar');
  const previewList = document.getElementById('previewList');
  const emptyState = document.getElementById('emptyState');
  const imageCountBadge = document.getElementById('imageCountBadge');
  const addMoreBtn = document.getElementById('addMoreBtn');
  const clearAllBtn = document.getElementById('clearAllBtn');
  const convertBtn = document.getElementById('convertBtn');
  const convertBtnText = document.getElementById('convertBtnText');
  const orientationSelect = document.getElementById('orientationSelect');
  const marginSelect = document.getElementById('marginSelect');

  // 로딩/진행률 오버레이 요소
  const loadingOverlay = document.getElementById('loadingOverlay');
  const loadingTitle = document.getElementById('loadingTitle');
  const loadingStatusText = document.getElementById('loadingStatusText');
  const progressBar = document.getElementById('progressBar');
  const progressPercent = document.getElementById('progressPercent');

  // 이미지 데이터 저장소 (Map: id -> imageObject)
  const imageMap = new Map();

  // 지원하는 이미지 MIME 타입 및 확장자
  const VALID_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
  const VALID_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif'];

  // 1. Sortable.js 초기화 (드래그 앤 드롭 순서 변경)
  if (typeof Sortable !== 'undefined') {
    new Sortable(previewList, {
      animation: 200,
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',
      dragClass: 'sortable-drag',
      handle: '.preview-card',
      filter: '.btn-delete',
      preventOnFilter: true,
      onEnd: () => {
        updatePageNumbers();
      }
    });
  } else {
    console.error('Sortable.js 라이브러리를 불러오지 못했습니다.');
  }

  // 2. 이벤트 리스너 등록
  // 클릭 시 파일 선택창 열기
  dropzone.addEventListener('click', () => fileInput.click());
  addMoreBtn.addEventListener('click', () => fileInput.click());

  // 키보드 접근성 (Enter/Space 키로 파일 선택창 열기)
  dropzone.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInput.click();
    }
  });

  // 파일 선택 변경 이벤트
  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
      fileInput.value = ''; // 재선택 가능하도록 초기화
    }
  });

  // 드래그 앤 드롭 이벤트 처리 (Dropzone)
  ['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove('dragover');
    });
  });

  dropzone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    if (dt && dt.files && dt.files.length > 0) {
      handleFiles(Array.from(dt.files));
    }
  });

  // 윈도우 전체에 파일 드롭 시 브라우저가 파일을 새 탭으로 여는 기본 동작 방지
  window.addEventListener('dragover', (e) => e.preventDefault(), false);
  window.addEventListener('drop', (e) => e.preventDefault(), false);

  // 전체 삭제 버튼
  clearAllBtn.addEventListener('click', () => {
    if (imageMap.size === 0) return;
    if (confirm('추가된 모든 이미지를 목록에서 삭제하시겠습니까?')) {
      imageMap.clear();
      previewList.innerHTML = '';
      updateUI();
    }
  });

  // PDF 변환 버튼
  convertBtn.addEventListener('click', generatePdf);

  /**
   * 파일 유효성 검사 및 비동기 로딩 처리
   * @param {File[]} files
   */
  async function handleFiles(files) {
    const validFiles = [];
    const invalidFiles = [];

    // 유효한 확장자 및 MIME 타입 검사
    files.forEach(file => {
      const ext = '.' + file.name.split('.').pop().toLowerCase();
      const isValidMime = VALID_MIME_TYPES.includes(file.type);
      const isValidExt = VALID_EXTENSIONS.includes(ext);

      if (isValidMime || isValidExt) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file.name);
      }
    });

    // 지원하지 않는 파일이 있는 경우 경고창 표시
    if (invalidFiles.length > 0) {
      alert(`다음 파일은 지원하지 않는 형식이므로 제외되었습니다 (JPG, PNG, GIF만 가능):\n- ${invalidFiles.join('\n- ')}`);
    }

    if (validFiles.length === 0) return;

    // 비동기로 이미지 파일 읽기
    for (const file of validFiles) {
      try {
        const imgData = await readImageFile(file);
        imageMap.set(imgData.id, imgData);
        appendPreviewCard(imgData);
      } catch (err) {
        console.error('이미지 로딩 실패:', file.name, err);
        alert(`'${file.name}' 파일을 읽는 도중 오류가 발생했습니다.`);
      }
    }

    updateUI();
  }

  /**
   * FileReader 및 Image 객체를 활용한 비동기 이미지 로딩
   * @param {File} file
   * @returns {Promise<Object>}
   */
  function readImageFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        const img = new Image();
        img.onload = () => {
          resolve({
            id: 'img_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
            file: file,
            name: file.name,
            size: formatBytes(file.size),
            dataUrl: dataUrl,
            width: img.naturalWidth,
            height: img.naturalHeight,
            type: file.type || 'image/jpeg'
          });
        };
        img.onerror = () => reject(new Error('이미지 규격을 분석할 수 없습니다.'));
        img.src = dataUrl;
      };
      reader.onerror = () => reject(new Error('파일 읽기 실패'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * 미리보기 카드 생성 및 리스트에 추가
   * @param {Object} item
   */
  function appendPreviewCard(item) {
    const card = document.createElement('div');
    card.className = 'preview-card';
    card.dataset.id = item.id;
    card.setAttribute('title', '드래그하여 페이지 순서를 변경할 수 있습니다.');

    const isLandscape = item.width > item.height;
    const orientationText = isLandscape ? '가로' : (item.width === item.height ? '정사각' : '세로');
    const orientationIcon = isLandscape ? '↔' : (item.width === item.height ? '⏹' : '↕');

    card.innerHTML = `
      <div class="card-header">
        <div style="display:flex; align-items:center;">
          <span class="page-badge">P. 1</span>
          <span class="orientation-badge" title="이미지 형태: ${orientationText}">${orientationIcon} ${orientationText}</span>
        </div>
        <div class="card-actions">
          <span class="drag-indicator" title="드래그 가능">⠿</span>
          <button type="button" class="btn-delete" title="이미지 삭제" aria-label="이미지 삭제">×</button>
        </div>
      </div>
      <div class="card-thumb-container">
        <img src="${item.dataUrl}" alt="${escapeHtml(item.name)}" class="card-thumb" loading="lazy">
      </div>
      <div class="card-footer">
        <div class="file-name" title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</div>
        <div class="file-meta">
          <span>${item.width} × ${item.height}px</span>
          <span>${item.size}</span>
        </div>
      </div>
    `;

    // 삭제 버튼 이벤트
    const deleteBtn = card.querySelector('.btn-delete');
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // 드래그 이벤트 전파 방지
      deleteImage(item.id, card);
    });

    previewList.appendChild(card);
  }

  /**
   * 개별 이미지 삭제
   * @param {string} id
   * @param {HTMLElement} cardElement
   */
  function deleteImage(id, cardElement) {
    imageMap.delete(id);
    cardElement.remove();
    updateUI();
  }

  /**
   * UI 상태 갱신 (개수, 빈 상태, 페이지 번호)
   */
  function updateUI() {
    const count = previewList.children.length;
    imageCountBadge.textContent = `선택된 이미지: ${count}장`;

    if (count > 0) {
      toolbar.classList.remove('hidden');
      emptyState.classList.add('hidden');
    } else {
      toolbar.classList.add('hidden');
      emptyState.classList.remove('hidden');
    }

    updatePageNumbers();
  }

  /**
   * 현재 렌더링된 DOM 순서에 맞춰 페이지 번호 배지 업데이트
   */
  function updatePageNumbers() {
    const cards = previewList.querySelectorAll('.preview-card');
    cards.forEach((card, index) => {
      const badge = card.querySelector('.page-badge');
      if (badge) {
        badge.textContent = `P. ${index + 1}`;
      }
    });
  }

  /**
   * PDF 변환 및 다운로드 처리 (jsPDF)
   */
  async function generatePdf() {
    const cardElements = Array.from(previewList.querySelectorAll('.preview-card'));
    if (cardElements.length === 0) {
      alert('변환할 이미지를 먼저 추가해 주세요.');
      return;
    }

    // jsPDF 라이브러리 로드 확인
    if (!window.jspdf || !window.jspdf.jsPDF) {
      alert('jsPDF 라이브러리를 불러오지 못했습니다. 인터넷 연결을 확인해 주세요.');
      return;
    }

    // UI 변환 상태 활성화
    setConvertingState(true);

    try {
      const { jsPDF } = window.jspdf;
      const orientationMode = orientationSelect ? orientationSelect.value : 'auto';
      const baseMargin = parseFloat(marginSelect.value) || 0;

      /**
       * 이미지 규격과 사용자 설정에 맞는 최적의 페이지 크기/방향 반환
       * @param {Object} item
       * @param {string} mode
       */
      function getOptimalPageConfig(item, mode) {
        const isLandscape = item.width > item.height;

        if (mode === 'portrait') {
          return { format: 'a4', orientation: 'portrait' };
        }
        if (mode === 'landscape') {
          return { format: 'a4', orientation: 'landscape' };
        }
        if (mode === 'original') {
          // 원본 비율 1:1 맞춤 (A4 최대 변 297mm 기준)
          const baseDim = 297;
          let w, h;
          if (isLandscape) {
            w = baseDim;
            h = parseFloat((baseDim / (item.width / item.height)).toFixed(2));
          } else {
            h = baseDim;
            w = parseFloat((baseDim * (item.width / item.height)).toFixed(2));
          }
          return { format: [w, h], orientation: isLandscape ? 'landscape' : 'portrait' };
        }

        // 기본값 'auto': 가로형 이미지는 A4 가로(Landscape), 세로/정사각 이미지는 A4 세로(Portrait)
        return {
          format: 'a4',
          orientation: isLandscape ? 'landscape' : 'portrait'
        };
      }

      // 첫 번째 이미지에 맞추어 최적 규격으로 jsPDF 인스턴스 초기화
      const firstCard = cardElements[0];
      const firstItem = imageMap.get(firstCard.dataset.id);
      const firstConfig = getOptimalPageConfig(firstItem, orientationMode);

      const doc = new jsPDF({
        orientation: firstConfig.orientation,
        unit: 'mm',
        format: firstConfig.format
      });

      const total = cardElements.length;

      // 순차적으로 이미지 처리 (브라우저 멈춤 방지를 위한 비동기 처리)
      for (let i = 0; i < total; i++) {
        const card = cardElements[i];
        const imageId = card.dataset.id;
        const item = imageMap.get(imageId);

        if (!item) continue;

        // 진행률 업데이트
        updateProgress(i + 1, total);

        const pageConfig = getOptimalPageConfig(item, orientationMode);

        // 첫 번째 페이지가 아니면 새 페이지 추가 (각 이미지별 최적 규격/방향 적용)
        if (i > 0) {
          doc.addPage(pageConfig.format, pageConfig.orientation);
        }

        // 현재 활성화된 페이지의 실제 가로/세로 크기 동적 취득
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = (orientationMode === 'original') ? 0 : baseMargin;

        const printableWidth = Math.max(1, pageWidth - (margin * 2));
        const printableHeight = Math.max(1, pageHeight - (margin * 2));

        // 이미지 비율(Aspect Ratio) 엄격 유지 & Scale-to-fit 계산
        const imgRatio = item.width / item.height;
        const pageRatio = printableWidth / printableHeight;

        let renderWidth, renderHeight;

        if (imgRatio > pageRatio) {
          // 가로가 상대적으로 긴 경우 -> 가로 너비 기준 맞춤
          renderWidth = printableWidth;
          renderHeight = printableWidth / imgRatio;
        } else {
          // 세로가 상대적으로 긴 경우 -> 세로 높이 기준 맞춤
          renderHeight = printableHeight;
          renderWidth = printableHeight * imgRatio;
        }

        // 여백 내에서 중앙 정렬 (Centering)
        const posX = margin + (printableWidth - renderWidth) / 2;
        const posY = margin + (printableHeight - renderHeight) / 2;

        // jsPDF에 전달할 이미지 포맷 결정
        let format = 'JPEG';
        if (item.type.includes('png') || item.type.includes('gif')) {
          format = 'PNG';
        }

        // PDF 페이지에 이미지 렌더링
        doc.addImage(
          item.dataUrl,
          format,
          posX,
          posY,
          renderWidth,
          renderHeight,
          undefined,
          'FAST'
        );

        // 브라우저 렌더링 루프에 제어권을 넘겨 스피너 및 진행률 바가 부드럽게 갱신되도록 양보
        await new Promise(resolve => setTimeout(resolve, 20));
      }

      // 상태 안내 업데이트
      loadingTitle.textContent = 'PDF 저장 중...';
      loadingStatusText.textContent = '완성된 PDF 파일을 다운로드하고 있습니다.';
      await new Promise(resolve => setTimeout(resolve, 100));

      // 요구사항 3.3: converted_images.pdf 명칭으로 즉시 자동 다운로드
      doc.save('converted_images.pdf');

    } catch (error) {
      console.error('PDF 변환 오류:', error);
      alert('PDF 변환 중 오류가 발생했습니다: ' + error.message);
    } finally {
      setConvertingState(false);
    }
  }

  /**
   * 변환 진행 상태 UI 설정
   * @param {boolean} isConverting
   */
  function setConvertingState(isConverting) {
    if (isConverting) {
      convertBtn.disabled = true;
      convertBtnText.textContent = 'PDF 변환 중...';
      loadingOverlay.classList.remove('hidden');
      loadingOverlay.setAttribute('aria-hidden', 'false');
      updateProgress(0, previewList.querySelectorAll('.preview-card').length);
    } else {
      convertBtn.disabled = false;
      convertBtnText.textContent = 'PDF로 변환하기';
      loadingOverlay.classList.add('hidden');
      loadingOverlay.setAttribute('aria-hidden', 'true');
    }
  }

  /**
   * 진행률 바 및 텍스트 갱신
   * @param {number} current
   * @param {number} total
   */
  function updateProgress(current, total) {
    const percent = total > 0 ? Math.round((current / total) * 100) : 0;
    progressBar.style.width = `${percent}%`;
    progressPercent.textContent = `${percent}% (${current}/${total})`;
    loadingTitle.textContent = `PDF 변환 중... (${current}/${total})`;
    loadingStatusText.textContent = `${current}번째 이미지를 A4 페이지에 맞추어 렌더링하고 있습니다.`;
  }

  /**
   * 파일 크기 포맷터 (Bytes -> KB, MB)
   * @param {number} bytes
   * @returns {string}
   */
  function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  /**
   * XSS 방지를 위한 HTML 이스케이프 함수
   * @param {string} str
   * @returns {string}
   */
  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
});
