export function extractTopRegion(address = '') {
  const clean = (address || '').trim();
  if (
    !clean ||
    clean === '주소 미기재' ||
    clean === '직접 등록 거래처' ||
    clean === 'SNS 연동 업체'
  ) {
    return '';
  }
  const firstToken = clean.split(/\s+/)[0] || '';
  return firstToken.replace(/(특별시|광역시|특별자치시|특별자치도|도|시)$/, '').trim();
}

export function buildRegionCompanyQuery(companyName = '', address = '') {
  const name = (companyName || '').trim();
  const topRegion = extractTopRegion(address);
  if (!topRegion || name.includes(topRegion)) {
    return name;
  }
  return `${topRegion} ${name}`.trim();
}

export function openInstagramSearchInApp(e, companyName, address = '') {
  const searchQuery = buildRegionCompanyQuery(companyName, address);
  if (!searchQuery) return;

  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(searchQuery).catch(() => {});
    }
  } catch (_) {}

  const tagKeyword = searchQuery.replace(/\s+/g, '');
  const webUrl = `https://www.instagram.com/explore/tags/${encodeURIComponent(tagKeyword)}/`;

  const ua = typeof navigator !== 'undefined' ? navigator.userAgent || '' : '';
  const isAndroid = /Android/i.test(ua);
  const isIOS = /iPhone|iPad|iPod/i.test(ua);

  if (!isAndroid && !isIOS) {
    return;
  }

  if (e && e.preventDefault) {
    e.preventDefault();
  }

  if (isAndroid) {
    const intentUrl = `intent://instagram.com/explore/tags/${encodeURIComponent(
      tagKeyword
    )}/#Intent;package=com.instagram.android;scheme=https;S.browser_fallback_url=${encodeURIComponent(
      webUrl
    )};end`;
    window.location.href = intentUrl;
    return;
  }

  if (isIOS) {
    const appScheme = `instagram://tag?name=${encodeURIComponent(tagKeyword)}`;
    const clickedAt = Date.now();
    window.location.href = appScheme;
    setTimeout(() => {
      if (document.visibilityState === 'visible' && Date.now() - clickedAt < 2200) {
        window.open(webUrl, '_blank', 'noopener,noreferrer');
      }
    }, 1200);
    return;
  }

  window.open(webUrl, '_blank', 'noopener,noreferrer');
}

export async function parseXlsxNatively(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer);
  const view = new DataView(arrayBuffer);
  const decoder = new TextDecoder('utf-8');
  const entries = {};

  const targetFiles = new Set(['xl/sharedStrings.xml', 'xl/worksheets/sheet1.xml']);

  const decompressEntry = async (method, rawData, fileName) => {
    if (method === 0) {
      return decoder.decode(rawData);
    }
    if (method === 8 && typeof DecompressionStream !== 'undefined') {
      const ds = new DecompressionStream('deflate-raw');
      const outPromise = new Response(ds.readable).arrayBuffer();
      const writer = ds.writable.getWriter();
      writer.write(rawData);
      writer.close();
      const outBuf = await outPromise;
      return decoder.decode(outBuf);
    }
    console.warn('지원하지 않는 압축 방식:', fileName, method);
    return null;
  };

  let eocdOffset = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65558); i--) {
    if (view.getUint32(i, true) === 0x06054b50) {
      eocdOffset = i;
      break;
    }
  }

  if (eocdOffset !== -1) {
    const cdCount = view.getUint16(eocdOffset + 10, true);
    const cdOffset = view.getUint32(eocdOffset + 16, true);
    let pos = cdOffset;

    for (let i = 0; i < cdCount && pos + 46 <= bytes.length; i++) {
      if (view.getUint32(pos, true) !== 0x02014b50) break;
      const method = view.getUint16(pos + 10, true);
      const compSize = view.getUint32(pos + 20, true);
      const nameLen = view.getUint16(pos + 28, true);
      const extraLen = view.getUint16(pos + 30, true);
      const commentLen = view.getUint16(pos + 32, true);
      const localOffset = view.getUint32(pos + 42, true);
      const fileName = decoder.decode(bytes.slice(pos + 46, pos + 46 + nameLen));

      if (targetFiles.has(fileName) || fileName.startsWith('xl/worksheets/sheet')) {
        const lNameLen = view.getUint16(localOffset + 26, true);
        const lExtraLen = view.getUint16(localOffset + 28, true);
        const dataStart = localOffset + 30 + lNameLen + lExtraLen;
        const rawData = bytes.slice(dataStart, dataStart + compSize);
        try {
          const text = await decompressEntry(method, rawData, fileName);
          if (text) entries[fileName] = text;
        } catch (err) {
          console.warn('XML 압축 해제 실패:', fileName, err);
        }
      }

      pos += 46 + nameLen + extraLen + commentLen;
    }
  }

  const sheetKey = entries['xl/worksheets/sheet1.xml']
    ? 'xl/worksheets/sheet1.xml'
    : Object.keys(entries).find((k) => k.startsWith('xl/worksheets/sheet'));

  if (!sheetKey) return [];

  const xmlParser = new DOMParser();
  const sharedStrings = [];
  if (entries['xl/sharedStrings.xml']) {
    const ssDoc = xmlParser.parseFromString(entries['xl/sharedStrings.xml'], 'application/xml');
    const siNodes = ssDoc.getElementsByTagName('si');
    for (let i = 0; i < siNodes.length; i++) {
      const tNodes = siNodes[i].getElementsByTagName('t');
      let combined = '';
      for (let j = 0; j < tNodes.length; j++) {
        combined += tNodes[j].textContent || '';
      }
      sharedStrings.push(combined);
    }
  }

  const colLetterToIndex = (ref) => {
    const letters = (ref || '').replace(/[0-9]/g, '');
    let idx = 0;
    for (let i = 0; i < letters.length; i++) {
      idx = idx * 26 + (letters.charCodeAt(i) - 64);
    }
    return Math.max(0, idx - 1);
  };

  const sheetDoc = xmlParser.parseFromString(entries[sheetKey], 'application/xml');
  const rowNodes = sheetDoc.getElementsByTagName('row');
  const resultRows = [];

  for (let i = 0; i < rowNodes.length; i++) {
    const rowArr = [];
    const cNodes = rowNodes[i].getElementsByTagName('c');
    for (let j = 0; j < cNodes.length; j++) {
      const cell = cNodes[j];
      const ref = cell.getAttribute('r') || '';
      const colIdx = ref ? colLetterToIndex(ref) : j;
      const type = cell.getAttribute('t');
      let val = '';

      if (type === 's') {
        const vNode = cell.getElementsByTagName('v')[0];
        const sIdx = vNode ? Number(vNode.textContent) : -1;
        val = sIdx >= 0 && sharedStrings[sIdx] !== undefined ? sharedStrings[sIdx] : '';
      } else if (type === 'inlineStr') {
        const tNode = cell.getElementsByTagName('t')[0];
        val = tNode ? tNode.textContent || '' : '';
      } else {
        const vNode = cell.getElementsByTagName('v')[0];
        val = vNode ? vNode.textContent || '' : '';
      }

      rowArr[colIdx] = val;
    }
    resultRows.push(rowArr);
  }

  return resultRows;
}

export function inferPartnerMetadata(companyName = '', address = '', idx = 0) {
  const combined = `${companyName} ${address}`;
  let category = '고등어';
  const mainProduct = '네이버 메뉴 서칭 대기';
  let unitPrice = 38500;
  let unitLabel = '원/상자';
  let volumeUnit = '상자';

  if (combined.includes('삼치') || combined.includes('여수')) {
    category = '삼치';
    unitPrice = 64000;
    unitLabel = '원/상자';
    volumeUnit = '상자';
  } else if (
    combined.includes('금태') ||
    combined.includes('눈볼대') ||
    combined.includes('일식') ||
    combined.includes('오마카세')
  ) {
    category = '금태';
    unitPrice = 48500;
    unitLabel = '원/kg';
    volumeUnit = 'kg';
  } else if (combined.includes('전갱이') || combined.includes('통영') || combined.includes('아지')) {
    category = '전갱이';
    unitPrice = 29800;
    unitLabel = '원/상자';
    volumeUnit = '상자';
  }

  const combinedQuery = buildRegionCompanyQuery(companyName, address);
  const tagKeyword = combinedQuery.replace(/\s+/g, '');

  return {
    snsPlatform: 'Instagram',
    snsHandle: `#${tagKeyword}`,
    instagramUrl: `https://www.instagram.com/explore/tags/${encodeURIComponent(tagKeyword)}/`,
    blogUrl: `https://search.naver.com/search.naver?query=${encodeURIComponent(combinedQuery)}`,
    category,
    mainProduct,
    topReviewMenu: '',
    searchedMenus: [],
    aiSummary: '',
    isSearched: false,
    unitPrice,
    unitLabel,
    totalVolume: 120 + (idx % 10) * 15,
    volumeUnit,
    status: '활발',
    lastOrder: '2026-11-18',
  };
}

export function parseSnsPostText(rawText = '') {
  const text = String(rawText || '');
  const speciesList = ['삼치', '금태', '고등어', '전갱이'];
  let species = '고등어';
  for (const sp of speciesList) {
    if (
      text.includes(sp) ||
      (sp === '금태' && text.includes('눈볼대')) ||
      (sp === '전갱이' && text.includes('아지'))
    ) {
      species = sp;
      break;
    }
  }

  const priceMatch = text.match(/(\d{1,3}(?:,\d{3})+|\d{4,6})\s*원/);
  const unitPrice = priceMatch ? Number(priceMatch[1].replace(/,/g, '')) : 39000;
  const isKg = text.toLowerCase().includes('kg') && !text.includes('상자');
  const unitLabel = isKg ? '원/kg' : '원/상자';

  const volMatch = text.match(/(\d+)\s*(상자|박스|kg|마리)/i);
  const volume = volMatch ? Number(volMatch[1]) : 100;
  const volumeUnit = volMatch && volMatch[2].toLowerCase() === 'kg' ? 'kg' : '상자';

  const specMatch = text.match(/(\d+\s*kg[^,\n.]*|특대|대자|선망|산지\s*직송)/i);
  const spec = specMatch ? specMatch[0].trim() : `${species} 산지 직송 특선`;

  return {
    species,
    spec,
    unitPrice,
    unitLabel,
    volume,
    volumeUnit,
    available: true,
  };
}