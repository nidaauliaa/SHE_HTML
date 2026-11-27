// ===== Penulis XLSX tanpa library & tanpa internet =====
// Mendukung: style (font/fill/border/align/format), merge, lebar kolom/tinggi baris, rumus, foto, grafik (bar + garis target + data table)
const XL = {
  T: (() => { const t = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++)c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0 } return t })(),
  crc(b) { let c = 0xFFFFFFFF; for (let i = 0; i < b.length; i++)c = XL.T[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0 },
  enc: s => new TextEncoder().encode(s),
  x: s => String(s).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').replace(/[&<>"]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m])),
  col(i) { let s = ''; i++; while (i > 0) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26) } return s },
  ref: (r, c) => XL.col(c) + (r + 1),                       // r,c 0-based
  px: w => Math.round(w * 7 + 5),                           // lebar kolom (karakter) -> piksel
  zip(files) {
    const u16 = v => [v & 255, (v >> 8) & 255], u32 = v => [v & 255, (v >> 8) & 255, (v >> 16) & 255, (v >>> 24) & 255], parts = [], cd = []; let off = 0;
    for (const f of files) {
      const n = XL.enc(f.n), c = XL.crc(f.d), L = f.d.length;
      const h = new Uint8Array([0x50, 0x4b, 3, 4, 20, 0, 0, 8, 0, 0, 0, 0, 0x21, 0, ...u32(c), ...u32(L), ...u32(L), ...u16(n.length), 0, 0]); parts.push(h, n, f.d);
      cd.push(new Uint8Array([0x50, 0x4b, 1, 2, 20, 0, 20, 0, 0, 8, 0, 0, 0, 0, 0x21, 0, ...u32(c), ...u32(L), ...u32(L), ...u16(n.length), 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ...u32(off)]), n); off += h.length + n.length + L
    }
    const cs = cd.reduce((a, b) => a + b.length, 0), end = new Uint8Array([0x50, 0x4b, 5, 6, 0, 0, 0, 0, ...u16(files.length), ...u16(files.length), ...u32(cs), ...u32(off), 0, 0]);
    const all = [...parts, ...cd, end], out = new Uint8Array(all.reduce((a, b) => a + b.length, 0)); let p = 0; for (const a of all) { out.set(a, p); p += a.length } return out
  },
  // ---- registry style: s={font:{sz,b,u,color},fill:'RRGGBB',bd:{l,r,t,b:'thin'|'medium'},al:{h,v,wrap,rot},fmt:'0.00'}
  Styles() {
    const fonts = ['<font><sz val="11"/><name val="Times New Roman"/></font>'], fills = ['<fill><patternFill patternType="none"/></fill>', '<fill><patternFill patternType="gray125"/></fill>'], borders = ['<border><left/><right/><top/><bottom/><diagonal/></border>'], fmts = [], xfs = ['<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>'], memo = {};
    const idx = (a, x) => { let i = a.indexOf(x); if (i < 0) { a.push(x); i = a.length - 1 } return i };
    return {
      id(s) {
        if (!s) return 0; const k = JSON.stringify(s); if (memo[k] != null) return memo[k];
        const f = s.font || {}, fo = idx(fonts, `<font>${f.b ? '<b/>' : ''}${f.u ? '<u/>' : ''}<sz val="${f.sz || 11}"/>${f.color ? `<color rgb="FF${f.color}"/>` : ''}<name val="${f.n || 'Times New Roman'}"/></font>`),
          fi = s.fill ? idx(fills, `<fill><patternFill patternType="solid"><fgColor rgb="FF${s.fill}"/><bgColor indexed="64"/></patternFill></fill>`) : 0,
          b = s.bd || {}, side = (n, v) => v ? `<${n} style="${v}"><color rgb="FF000000"/></${n}>` : `<${n}/>`, bo = s.bd ? idx(borders, `<border>${side('left', b.l)}${side('right', b.r)}${side('top', b.t)}${side('bottom', b.b)}<diagonal/></border>`) : 0,
          nf = s.fmt ? (fmts.indexOf(s.fmt) < 0 ? (fmts.push(s.fmt), fmts.length - 1) : fmts.indexOf(s.fmt)) + 164 : 0, a = s.al || {},
          al = s.al ? `<alignment${a.h ? ` horizontal="${a.h}"` : ''}${a.v ? ` vertical="${a.v}"` : ''}${a.wrap ? ' wrapText="1"' : ''}${a.rot != null ? ` textRotation="${a.rot}"` : ''}/>` : '';
        xfs.push(`<xf numFmtId="${nf}" fontId="${fo}" fillId="${fi}" borderId="${bo}" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyNumberFormat="1"${s.al ? ' applyAlignment="1"' : ''}>${al}</xf>`); return memo[k] = xfs.length - 1
      },
      xml() { return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">${fmts.length ? `<numFmts count="${fmts.length}">${fmts.map((f, i) => `<numFmt numFmtId="${164 + i}" formatCode="${XL.x(f)}"/>`).join('')}</numFmts>` : ''}<fonts count="${fonts.length}">${fonts.join('')}</fonts><fills count="${fills.length}">${fills.join('')}</fills><borders count="${borders.length}">${borders.join('')}</borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="${xfs.length}">${xfs.join('')}</cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>` }
    }
  },
  // ---- sheet builder (r,c 0-based)
  Sheet(name, o = {}) {
    return {
      name, cells: {}, merges: [], cw: {}, rh: {}, images: [], charts: [], zoom: o.zoom, grid: o.grid !== false, fit: o.fit || 'width', dr: o.dr || 15.75,
      set(r, c, v, s, f) { this.cells[r + ',' + c] = { v, s, f }; return this },
      style(r, c, s) { const k = r + ',' + c; (this.cells[k] = this.cells[k] || {}).s = s; return this },
      merge(r1, c1, r2, c2) { this.merges.push([r1, c1, r2, c2]); return this },
      colW(c, w) { this.cw[c] = w; return this }, rowH(r, h) { this.rh[r] = h; return this },
      colPx(c) { return XL.px(this.cw[c] ?? 9) }, rowPx(r) { return Math.round((this.rh[r] ?? this.dr) * 4 / 3) },
      // koordinat absolut (px) -> {col,off(EMU),row,off(EMU)}
      at(x, y) { let c = 0, r = 0; while (x >= this.colPx(c)) { x -= this.colPx(c); c++ } while (y >= this.rowPx(r)) { y -= this.rowPx(r); r++ } return { c, co: x * 9525, r, ro: y * 9525 } },
      topPx(r) { let y = 0; for (let i = 0; i < r; i++)y += this.rowPx(i); return y }, leftPx(c) { let x = 0; for (let i = 0; i < c; i++)x += this.colPx(i); return x },
      image(bytes, ext, x, y, w, h) { this.images.push({ bytes, ext, x, y, w, h }); return this },          // px absolut
      chart(cfg, x, y, w, h) { this.charts.push({ cfg, x, y, w, h }); return this }
    }
  },
  sheetXml(sh, st, hasDr) {
    const rows = {}; for (const k in sh.cells) { const [r, c] = k.split(',').map(Number); (rows[r] = rows[r] || {})[c] = sh.cells[k] }
    Object.keys(sh.rh).forEach(r => { rows[r] = rows[r] || {} });
    const body = Object.keys(rows).map(Number).sort((a, b) => a - b).map(r => {
      const h = sh.rh[r]; return `<row r="${r + 1}"${h != null ? ` ht="${h}" customHeight="1"` : ''}>` + Object.keys(rows[r]).map(Number).sort((a, b) => a - b).map(c => {
        const o = rows[r][c], s = st.id(o.s), sa = s ? ` s="${s}"` : '', rf = XL.ref(r, c), v = o.v;
        if (o.f) return `<c r="${rf}"${sa}><f>${XL.x(o.f)}</f>${typeof v === 'number' ? `<v>${v}</v>` : ''}</c>`;
        if (v == null || v === '') return `<c r="${rf}"${sa}/>`;
        return typeof v === 'number' && isFinite(v) ? `<c r="${rf}"${sa}><v>${v}</v></c>` : `<c r="${rf}"${sa} t="inlineStr"><is><t xml:space="preserve">${XL.x(v)}</t></is></c>`
      }).join('') + '</row>'
    }).join('');
    const cols = Object.keys(sh.cw).map(Number).sort((a, b) => a - b).map(c => `<col min="${c + 1}" max="${c + 1}" width="${sh.cw[c]}" customWidth="1"/>`).join('');
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheetPr><pageSetUpPr fitToPage="1"/></sheetPr><sheetViews><sheetView${sh.grid ? '' : ' showGridLines="0"'}${sh.zoom ? ` zoomScale="${sh.zoom}" zoomScaleNormal="${sh.zoom}"` : ''} workbookViewId="0"/></sheetViews><sheetFormatPr defaultRowHeight="${sh.dr}"/>${cols ? `<cols>${cols}</cols>` : ''}<sheetData>${body}</sheetData>${sh.merges.length ? `<mergeCells count="${sh.merges.length}">${sh.merges.map(m => `<mergeCell ref="${XL.ref(m[0], m[1])}:${XL.ref(m[2], m[3])}"/>`).join('')}</mergeCells>` : ''}<printOptions horizontalCentered="1"/><pageMargins left="0.25" right="0.25" top="0.3" bottom="0.3" header="0.2" footer="0.2"/><pageSetup paperSize="9" orientation="landscape" fitToWidth="1" fitToHeight="${sh.fit === 'page' ? 1 : 0}"/>${hasDr ? '<drawing r:id="rId1"/>' : ''}</worksheet>`
  },
  drawingXml(sh, nImg0, nCh0) {
    const A = (x, y, w, h, inner, id) => { const p = sh.at(x, y); return `<xdr:oneCellAnchor><xdr:from><xdr:col>${p.c}</xdr:col><xdr:colOff>${p.co}</xdr:colOff><xdr:row>${p.r}</xdr:row><xdr:rowOff>${p.ro}</xdr:rowOff></xdr:from><xdr:ext cx="${Math.round(w * 9525)}" cy="${Math.round(h * 9525)}"/>${inner}<xdr:clientData/></xdr:oneCellAnchor>` };
    let id = 1, rel = 0, out = '';
    sh.images.forEach(m => { rel++; id++; out += A(m.x, m.y, m.w, m.h, `<xdr:pic><xdr:nvPicPr><xdr:cNvPr id="${id}" name="Foto ${id}"/><xdr:cNvPicPr><a:picLocks noChangeAspect="1"/></xdr:cNvPicPr></xdr:nvPicPr><xdr:blipFill><a:blip r:embed="rId${rel}"/><a:stretch><a:fillRect/></a:stretch></xdr:blipFill><xdr:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${Math.round(m.w * 9525)}" cy="${Math.round(m.h * 9525)}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></xdr:spPr></xdr:pic>`) });
    sh.charts.forEach(m => { rel++; id++; out += A(m.x, m.y, m.w, m.h, `<xdr:graphicFrame macro=""><xdr:nvGraphicFramePr><xdr:cNvPr id="${id}" name="Chart ${id}"/><xdr:cNvGraphicFramePr/></xdr:nvGraphicFramePr><xdr:xfrm><a:off x="0" y="0"/><a:ext cx="${Math.round(m.w * 9525)}" cy="${Math.round(m.h * 9525)}"/></xdr:xfrm><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/chart"><c:chart xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" r:id="rId${rel}"/></a:graphicData></a:graphic></xdr:graphicFrame>`) });
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">${out}</xdr:wsDr>`
  },
  // grafik: kolom bagian (bar berwarna) + TARGET (garis), data table + legend di bawah, judul 2 baris
  chartXml(c) {
    const q = XL.x, sn = "'" + c.sheet + "'!", tp = (t) => `<c:txPr><a:bodyPr/><a:lstStyle/><a:p><a:pPr><a:defRPr sz="${t}" b="0"><a:solidFill><a:srgbClr val="595959"/></a:solidFill></a:defRPr></a:pPr><a:endParaRPr lang="en-US"/></a:p></c:txPr>`,
    catRef = `${sn}$${c.catCol}$${c.r1}:$${c.catCol}$${c.r2}`, catC = `<c:strCache><c:ptCount val="${c.cats.length}"/>${c.cats.map((z, i) => `<c:pt idx="${i}"><c:v>${q(z)}</c:v></c:pt>`).join('')}</c:strCache>`,
    numC = a => `<c:numCache><c:formatCode>0.00</c:formatCode><c:ptCount val="${a.length}"/>${a.map((z, i) => z == null ? '' : `<c:pt idx="${i}"><c:v>${z}</c:v></c:pt>`).join('')}</c:numCache>`,
    lbl = pos => `<c:dLbls><c:spPr><a:noFill/><a:ln><a:noFill/></a:ln></c:spPr>${tp(900)}<c:dLblPos val="${pos}"/><c:showLegendKey val="0"/><c:showVal val="1"/><c:showCatName val="0"/><c:showSerName val="0"/><c:showPercent val="0"/><c:showBubbleSize val="0"/></c:dLbls>`,
    ser = (i, col, name, vals, sp, extra) => `<c:ser><c:idx val="${i}"/><c:order val="${i}"/><c:tx><c:strRef><c:f>${sn}$${col}$${c.hr}</c:f><c:strCache><c:ptCount val="1"/><c:pt idx="0"><c:v>${q(name)}</c:v></c:pt></c:strCache></c:strRef></c:tx>${sp}${extra}<c:cat><c:strRef><c:f>${catRef}</c:f>${catC}</c:strRef></c:cat><c:val><c:numRef><c:f>${sn}$${col}$${c.r1}:$${col}$${c.r2}</c:f>${numC(vals)}</c:numRef></c:val>`,
    line = `<a:ln w="9525"><a:solidFill><a:srgbClr val="D9D9D9"/></a:solidFill></a:ln>`, para = (t, b) => `<a:p><a:pPr><a:defRPr sz="1400" b="1"/></a:pPr><a:r><a:rPr lang="en-US" sz="1400" b="1"><a:solidFill><a:srgbClr val="595959"/></a:solidFill></a:rPr><a:t>${q(t)}</a:t></a:r></a:p>`;
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><c:chartSpace xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><c:roundedCorners val="0"/><c:chart><c:title><c:tx><c:rich><a:bodyPr/><a:lstStyle/>${para(c.t1)}${para(c.t2)}</c:rich></c:tx><c:overlay val="0"/></c:title><c:autoTitleDeleted val="0"/><c:plotArea><c:layout/>` +
      `<c:barChart><c:barDir val="col"/><c:grouping val="clustered"/><c:varyColors val="0"/>${ser(1, c.valCol, c.name, c.vals, `<c:spPr><a:solidFill><a:srgbClr val="${c.color}"/></a:solidFill></c:spPr>`, `<c:invertIfNegative val="0"/>${lbl('outEnd')}`)}</c:ser><c:gapWidth val="219"/><c:axId val="111111111"/><c:axId val="222222222"/></c:barChart>` +
      `<c:lineChart><c:grouping val="standard"/><c:varyColors val="0"/>${ser(0, c.tgtCol, 'TARGET', c.tgt, `<c:spPr><a:ln w="28575" cap="rnd"><a:solidFill><a:srgbClr val="4472C4"/></a:solidFill><a:round/></a:ln></c:spPr>`, `<c:marker><c:symbol val="none"/></c:marker>${lbl('r')}`)}<c:smooth val="0"/></c:ser><c:marker val="1"/><c:axId val="111111111"/><c:axId val="222222222"/></c:lineChart>` +
      `<c:catAx><c:axId val="111111111"/><c:scaling><c:orientation val="minMax"/></c:scaling><c:delete val="0"/><c:axPos val="b"/><c:numFmt formatCode="General" sourceLinked="1"/><c:majorTickMark val="none"/><c:minorTickMark val="none"/><c:tickLblPos val="nextTo"/><c:spPr>${line}</c:spPr>${tp(900)}<c:crossAx val="222222222"/><c:crosses val="autoZero"/><c:auto val="1"/><c:lblAlgn val="ctr"/><c:lblOffset val="100"/><c:noMultiLvlLbl val="0"/></c:catAx>` +
      `<c:valAx><c:axId val="222222222"/><c:scaling><c:orientation val="minMax"/><c:min val="0"/></c:scaling><c:delete val="0"/><c:axPos val="l"/><c:majorGridlines><c:spPr>${line}</c:spPr></c:majorGridlines><c:numFmt formatCode="0.00" sourceLinked="0"/><c:majorTickMark val="none"/><c:minorTickMark val="none"/><c:tickLblPos val="nextTo"/><c:spPr><a:ln><a:noFill/></a:ln></c:spPr>${tp(900)}<c:crossAx val="111111111"/><c:crosses val="autoZero"/><c:crossBetween val="between"/></c:valAx>` +
      `<c:dTable><c:showHorzBorder val="1"/><c:showVertBorder val="1"/><c:showOutline val="1"/><c:showKeys val="1"/><c:spPr><a:noFill/><a:ln w="9525"><a:solidFill><a:srgbClr val="D9D9D9"/></a:solidFill></a:ln></c:spPr>${tp(900)}</c:dTable></c:plotArea><c:legend><c:legendPos val="b"/><c:layout/><c:overlay val="0"/><c:spPr><a:noFill/><a:ln><a:noFill/></a:ln></c:spPr>${tp(900)}</c:legend><c:plotVisOnly val="1"/><c:dispBlanksAs val="gap"/></c:chart><c:spPr><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill><a:ln w="9525"><a:solidFill><a:srgbClr val="D9D9D9"/></a:solidFill></a:ln></c:spPr></c:chartSpace>`
  },
  bytes(book) {
    const H = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', R = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships', st = XL.Styles(), F = [], ct = [], sheets = book.sheets; let nImg = 0, nCh = 0, nDr = 0, exts = new Set();
    sheets.forEach((sh, i) => {
      const has = sh.images.length || sh.charts.length; let rels = '';
      if (has) {
        nDr++; let dr = '', k = 0; sh.images.forEach(m => { k++; nImg++; exts.add(m.ext); F.push({ n: `xl/media/image${nImg}.${m.ext}`, d: m.bytes }); dr += `<Relationship Id="rId${k}" Type="${R}/image" Target="../media/image${nImg}.${m.ext}"/>` });
        sh.charts.forEach(m => { k++; nCh++; F.push({ n: `xl/charts/chart${nCh}.xml`, d: XL.enc(XL.chartXml(m.cfg)) }); ct.push(`<Override PartName="/xl/charts/chart${nCh}.xml" ContentType="application/vnd.openxmlformats-officedocument.drawingml.chart+xml"/>`); dr += `<Relationship Id="rId${k}" Type="${R}/chart" Target="../charts/chart${nCh}.xml"/>` });
        F.push({ n: `xl/drawings/drawing${nDr}.xml`, d: XL.enc(XL.drawingXml(sh)) }, { n: `xl/drawings/_rels/drawing${nDr}.xml.rels`, d: XL.enc(H + `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${dr}</Relationships>`) });
        ct.push(`<Override PartName="/xl/drawings/drawing${nDr}.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/>`);
        F.push({ n: `xl/worksheets/_rels/sheet${i + 1}.xml.rels`, d: XL.enc(H + `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="${R}/drawing" Target="../drawings/drawing${nDr}.xml"/></Relationships>`) })
      }
      F.push({ n: `xl/worksheets/sheet${i + 1}.xml`, d: XL.enc(XL.sheetXml(sh, st, has)) }); ct.push(`<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`)
    });
    const base = [{ n: '[Content_Types].xml', d: H + `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>${[...exts].map(e => `<Default Extension="${e}" ContentType="image/${e === 'jpg' ? 'jpeg' : e}"/>`).join('')}<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${ct.join('')}</Types>` },
    { n: '_rels/.rels', d: H + `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="${R}/officeDocument" Target="xl/workbook.xml"/></Relationships>` },
    { n: 'xl/workbook.xml', d: H + `<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="${R}"><sheets>${sheets.map((s, i) => `<sheet name="${XL.x(s.name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('')}</sheets></workbook>` },
    { n: 'xl/_rels/workbook.xml.rels', d: H + `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets.map((s, i) => `<Relationship Id="rId${i + 1}" Type="${R}/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('')}<Relationship Id="rId${sheets.length + 1}" Type="${R}/styles" Target="styles.xml"/></Relationships>` },
    { n: 'xl/styles.xml', d: st.xml() }].map(z => ({ n: z.n, d: typeof z.d === 'string' ? XL.enc(z.d) : z.d }));
    return XL.zip([...base, ...F])
  },
  download(name, book) { const b = new Blob([XL.bytes(book)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove() }, 800) }
};
