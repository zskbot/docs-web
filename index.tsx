import { useState, useEffect } from "react";
import {
  Terminal, GitBranch, ShieldCheck, Layers, Radar, Puzzle,
  Database, Boxes, Users, ArrowRight, Github, Check, X,
  ChevronDown, Sparkles, Plus, Minus
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  DATA                                                               */
/* ------------------------------------------------------------------ */

const NAV = [
  { id: "home", label: "Trang chủ" },
  { id: "features", label: "Tính năng" },
  { id: "docs", label: "Tài liệu" },
  { id: "pricing", label: "Chi phí" },
];

const STATS = [
  { value: "1", label: "backend, mọi agent" },
  { value: "0", label: "API key lộ ra client" },
  { value: "∞", label: "agent mở rộng ngang hàng" },
  { value: "6+", label: "khối chức năng cốt lõi" },
];

const FEATURES = [
  { icon: Boxes, title: "Agent runtime", text: "Điều phối nhiều agent AI chạy song song trên cùng một canvas. Mỗi agent gọi backend riêng để lấy kết quả — không agent nào chạm trực tiếp vào key." },
  { icon: Puzzle, title: "Thư viện skill", text: "Skill được nạp theo yêu cầu, đóng gói quy trình lặp lại thành từng khối tái sử dụng — viết một lần, mọi agent trong workspace đều dùng được." },
  { icon: Radar, title: "Nhật ký & giám sát", text: "Mọi lệnh gọi đi qua backend đều được ghi log. Theo dõi chi phí, độ trễ và tỉ lệ lỗi theo thời gian thực, ngay trong bảng điều khiển." },
  { icon: ShieldCheck, title: "API key không rời server", text: "Key của Anthropic hay bất kỳ nhà cung cấp nào chỉ tồn tại trong biến môi trường phía backend — không bao giờ xuất hiện trong mã nguồn frontend." },
  { icon: Database, title: "Storage & build", text: "Lưu trạng thái agent, artefact build, và dữ liệu người dùng trong cùng một hạ tầng thay vì rải rác qua nhiều dịch vụ rời." },
  { icon: Users, title: "Dịch vụ người dùng", text: "Một lớp user service dùng chung cho mọi agent — xác thực, phiên làm việc, quyền hạn — thay vì mỗi agent tự vá một kiểu." },
];

const PRINCIPLES = [
  { num: "01", title: "Key không rời máy chủ", text: "Không có ngoại lệ. Nếu một tính năng cần key ở phía client, tính năng đó chưa xong." },
  { num: "02", title: "Không khoá nhà cung cấp", text: "server.js chỉ là một hàm fetch — đổi provider là đổi một URL, không viết lại kiến trúc." },
  { num: "03", title: "Log là bắt buộc, không tuỳ chọn", text: "Một request không log là một request không thể debug khi có sự cố." },
  { num: "04", title: "Mở rộng ngang, không mở rộng dọc", text: "Thêm agent bằng cách thêm pane, không phải bằng cách viết thêm nhánh if." },
];

const NOTES = [
  { tag: "v1.0", title: "Vì sao có backend trung gian", text: "Bản đầu tiên chỉ làm đúng một việc: giấu key. Mọi request từ canvas đều đi qua một endpoint /api/chat duy nhất — chưa tối ưu, nhưng không lộ." },
  { tag: "v1.1", title: "Hàng đợi request khi nhiều agent cùng gọi", text: "Khi 3-4 agent gọi backend cùng lúc, cần hàng đợi và rate-limit theo từng agent để một agent lỗi không kéo sập cả canvas." },
  { tag: "v1.2", title: "Log không chỉ để xem, mà để cảnh báo", text: "Bảng điều khiển giám sát bắt đầu từ nhu cầu rất cụ thể: biết agent nào đang tốn tiền nhất, trước khi hoá đơn cuối tháng báo." },
];

const FAQ = [
  { q: "Velclaw có lưu API key ở đâu trên trình duyệt không?", a: "Không. Key chỉ tồn tại trong biến môi trường phía server (.env). Client chỉ gửi request nghiệp vụ tới backend, không bao giờ cầm key thật." },
  { q: "Có bắt buộc dùng Anthropic API không?", a: "Không. Endpoint backend chỉ là một hàm fetch tới URL nhà cung cấp — đổi provider tương đương đổi một dòng cấu hình, không cần viết lại agent runtime." },
  { q: "Chạy trên hệ điều hành nào?", a: "Backend là Node.js thuần nên chạy được ở bất kỳ đâu Node chạy được — máy cá nhân, VPS, hay serverless function. Không ràng buộc hệ điều hành cụ thể." },
  { q: "Có cần tài khoản Velclaw để dùng không?", a: "Không. Bạn tự host backend và mang key của chính mình — không có lớp tài khoản trung gian nào giữa bạn và nhà cung cấp AI." },
  { q: "Log request được lưu ở đâu?", a: "Tuỳ bạn cấu hình — mặc định log nằm trên chính backend bạn tự host, cùng hạ tầng với nơi bạn đặt API key." },
];

const ROADMAP = [
  { tag: "v1.0", title: "Backend trung gian ổn định", text: "Proxy API key, endpoint chat cơ bản." },
  { tag: "v1.1", title: "Đa agent song song", text: "Hàng đợi request, giới hạn tốc độ theo từng agent." },
  { tag: "v1.2", title: "Bảng điều khiển giám sát", text: "Chi phí, độ trễ và tỉ lệ lỗi theo thời gian thực." },
];

const INTEGRATIONS = [
  { name: "Anthropic API", status: "connected" },
  { name: "VS Code", status: "ready" },
  { name: "GitHub", status: "pending" },
];

const COMPARE_ROWS = [
  "API key giữ phía backend, không lộ ra client",
  "Nhiều agent chạy song song trên một canvas",
  "Skill dùng chung, nạp theo yêu cầu",
  "Log chi phí & lỗi theo thời gian thực",
  "Tự host, không phụ thuộc dịch vụ bên thứ ba",
];

const TICKER_ITEMS = [
  "AGENT RUNTIME", "SKILL LIBRARY", "BACKEND PROXY", "0 KEY LỘ RA CLIENT",
  "GIÁM SÁT THỜI GIAN THỰC", "TỰ HOST", "MỞ RỘNG NGANG HÀNG",
];

const TECH_BADGES = [
  "Node.js", "Anthropic API", "GitHub", "VS Code", "JetBrains Mono", ".env",
  "REST", "Claude", "Express",
];

/* ------------------------------------------------------------------ */
/*  SMALL PIECES                                                       */
/* ------------------------------------------------------------------ */

function ClawMark({ className = "" }) {
  return (
    <svg viewBox="0 0 60 60" className={className} fill="none" aria-hidden="true">
      <path d="M6 4 L18 56" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
      <path d="M22 2 L32 58" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
      <path d="M38 6 L46 52" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" opacity="0.35" />
    </svg>
  );
}

function Pill({ children }) {
  return <span className="vc-pill">{children}</span>;
}

function SectionEyebrow({ children }) {
  return <div className="vc-eyebrow">{children}</div>;
}

function StatusDot({ status }) {
  const map = {
    connected: { color: "#59d99f", label: "Đã kết nối" },
    ready: { color: "#9d7fff", label: "Sẵn sàng" },
    pending: { color: "#5a5a63", label: "Chưa kết nối" },
  };
  const s = map[status];
  return (
    <span className="vc-status">
      <span className="vc-dot" style={{ background: s.color }} />
      {s.label}
    </span>
  );
}

function Marquee({ items }) {
  const loop = [...items, ...items];
  return (
    <div className="vc-marquee">
      <div className="vc-marquee-track">
        {loop.map((t, i) => (
          <span className="vc-marquee-item" key={i}>
            {t}<span className="vc-marquee-dot">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function LogoMarquee({ items }) {
  const loop = [...items, ...items];
  return (
    <div className="vc-logomarquee">
      <div className="vc-logomarquee-track">
        {loop.map((t, i) => <span className="vc-logo-badge" key={i}>{t}</span>)}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  NAV                                                                 */
/* ------------------------------------------------------------------ */

function NavBar({ page, setPage }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="vc-nav">
      <div className="vc-nav-inner">
        <button className="vc-logo" onClick={() => setPage("home")}>
          <ClawMark className="vc-logo-mark" />
          <span>Velclaw</span>
        </button>

        <nav className="vc-nav-links">
          {NAV.map((n) => (
            <button key={n.id} onClick={() => setPage(n.id)} className={`vc-nav-link ${page === n.id ? "is-active" : ""}`}>
              {n.label}
            </button>
          ))}
        </nav>

        <div className="vc-nav-cta">
          <a href="https://github.com/Velclaw/Velclaw" target="_blank" rel="noreferrer" className="vc-btn-ghost">
            <Github size={14} /> GitHub
          </a>
          <button className="vc-btn-primary" onClick={() => setPage("docs")}>
            Bắt đầu <ArrowRight size={13} />
          </button>
        </div>

        <button className="vc-nav-burger" onClick={() => setOpen((o) => !o)} aria-label="Menu">
          <span /><span /><span />
        </button>
      </div>

      {open && (
        <div className="vc-nav-mobile">
          {NAV.map((n) => (
            <button key={n.id} onClick={() => { setPage(n.id); setOpen(false); }} className={`vc-nav-mobile-link ${page === n.id ? "is-active" : ""}`}>
              {n.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}

/* ------------------------------------------------------------------ */
/*  HOME                                                                */
/* ------------------------------------------------------------------ */

function TerminalCanvas() {
  const panes = [
    { name: "agent-runtime", cmd: "$ velclaw run --agent claude", lines: ["> Điều phối 3 agent song song…", "Skill 'refactor' đã nạp", "✓ Kết quả trả về sau 1.2s"] },
    { name: "skill-lib", cmd: "$ velclaw skill list", lines: ["review-pr", "deploy-check", "refactor", "+ nạp theo yêu cầu"] },
    { name: "backend-proxy", cmd: "$ node server.js", lines: ["POST /api/chat 200", "key: process.env.* (ẩn)", "0 key lộ ra client"] },
    { name: "monitor", cmd: "$ velclaw logs --tail", lines: ["cost: $0.014 / req", "p95 latency: 340ms", "error rate: 0.0%"] },
  ];
  return (
    <div className="vc-canvas">
      {panes.map((p) => (
        <div className="vc-pane" key={p.name}>
          <div className="vc-pane-bar">
            <span className="vc-pane-dots"><i /><i /><i /></span>
            <span className="vc-pane-name">{p.name}</span>
          </div>
          <div className="vc-pane-body">
            <div className="vc-pane-cmd">{p.cmd}</div>
            {p.lines.map((l, i) => <div key={i} className="vc-pane-line">{l}</div>)}
            <div className="vc-caret">_</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function FeatureCard({ icon: Icon, title, text }) {
  return (
    <div className="vc-card">
      <div className="vc-card-icon"><Icon size={17} /></div>
      <h3 className="vc-card-title">{title}</h3>
      <p className="vc-card-text">{text}</p>
    </div>
  );
}

function FAQItem({ q, a, open, onToggle }) {
  return (
    <div className="vc-faq-item">
      <button className="vc-faq-q" onClick={onToggle}>
        <span>{q}</span>
        {open ? <Minus size={15} /> : <Plus size={15} />}
      </button>
      {open && <p className="vc-faq-a">{a}</p>}
    </div>
  );
}

function HomePage({ setPage }) {
  const [faqOpen, setFaqOpen] = useState(0);

  return (
    <>
      <section className="vc-hero">
        <div className="vc-hero-text">
          <Pill><Sparkles size={11} /> v1.0.0 · Bản phát hành đầu tiên</Pill>
          <h1 className="vc-h1">
            Một canvas. Nhiều agent AI.<br />
            <span className="vc-accent-text">Key không bao giờ rời server.</span>
          </h1>
          <p className="vc-lead">
            Velclaw là không gian làm việc kết nối agent, skill và các API AI của bên thứ ba
            thông qua một backend trung gian — để trình duyệt của bạn không bao giờ cần biết
            đến API key thật. Agent, code, build, runtime, storage và user service, gộp chung một chỗ.
          </p>
          <div className="vc-hero-cta">
            <button className="vc-btn-primary vc-btn-lg" onClick={() => setPage("docs")}>
              Thiết lập backend <ArrowRight size={15} />
            </button>
            <a href="https://github.com/Velclaw/Velclaw" target="_blank" rel="noreferrer" className="vc-btn-ghost vc-btn-lg">
              <Github size={15} /> Xem mã nguồn
            </a>
          </div>
          <div className="vc-hero-flags">
            <span>Node.js backend</span><span>·</span><span>Local-first proxy</span><span>·</span><span>Bring your own key</span>
          </div>
        </div>
      </section>

      <Marquee items={TICKER_ITEMS} />

      <TerminalCanvas />

      <section className="vc-stats">
        {STATS.map((s) => (
          <div className="vc-stat" key={s.label}>
            <div className="vc-stat-value">{s.value}</div>
            <div className="vc-stat-label">{s.label}</div>
          </div>
        ))}
      </section>

      <section className="vc-section">
        <SectionEyebrow>Kiến trúc</SectionEyebrow>
        <h2 className="vc-h2">Nguyên tắc cốt lõi</h2>
        <p className="vc-section-sub">
          API key của bên thứ ba chỉ tồn tại trên server của bạn — không bao giờ xuất hiện
          trong mã nguồn frontend, kể cả ở dạng comment hay biến ẩn.
        </p>
        <div className="vc-flow">
          <div className="vc-flow-node">Trình duyệt</div>
          <div className="vc-flow-arrow">→</div>
          <div className="vc-flow-node vc-flow-node-accent">Backend</div>
          <div className="vc-flow-arrow">→</div>
          <div className="vc-flow-node">API bên thứ 3</div>
        </div>
        <p className="vc-flow-caption">
          Yêu cầu đi qua backend — API key chỉ di chuyển ở chặng phía trong, không bao giờ tới trình duyệt.
        </p>
      </section>

      <LogoMarquee items={TECH_BADGES} />

      <section className="vc-section">
        <SectionEyebrow>Vì sao Velclaw</SectionEyebrow>
        <h2 className="vc-h2">Được xây cho workflow nhiều agent</h2>
        <div className="vc-grid-3">
          {FEATURES.slice(0, 3).map((f) => <FeatureCard key={f.title} {...f} />)}
        </div>
        <button className="vc-inline-link" onClick={() => setPage("features")}>
          Xem tất cả tính năng <ArrowRight size={13} />
        </button>
      </section>

      <section className="vc-section vc-section-tight">
        <SectionEyebrow>Triết lý</SectionEyebrow>
        <h2 className="vc-h2">Bốn nguyên tắc thiết kế</h2>
        <div className="vc-principles">
          {PRINCIPLES.map((p) => (
            <div className="vc-principle" key={p.num}>
              <span className="vc-principle-num">{p.num}</span>
              <div>
                <h3 className="vc-card-title">{p.title}</h3>
                <p className="vc-card-text">{p.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="vc-section vc-section-tight">
        <SectionEyebrow>Ghi chú phát triển</SectionEyebrow>
        <h2 className="vc-h2">Từ v1.0 đến v1.2, từng quyết định một</h2>
        <div className="vc-notes">
          {NOTES.map((n) => (
            <article className="vc-note" key={n.tag}>
              <span className="vc-roadmap-tag">{n.tag}</span>
              <h3 className="vc-card-title" style={{ marginTop: 10 }}>{n.title}</h3>
              <p className="vc-card-text">{n.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="vc-section vc-section-tight">
        <SectionEyebrow>Câu hỏi thường gặp</SectionEyebrow>
        <h2 className="vc-h2">Trước khi cài đặt</h2>
        <div className="vc-faq">
          {FAQ.map((f, i) => (
            <FAQItem key={f.q} q={f.q} a={f.a} open={faqOpen === i} onToggle={() => setFaqOpen(faqOpen === i ? -1 : i)} />
          ))}
        </div>
      </section>

      <section className="vc-cta-band">
        <ClawMark className="vc-cta-claw" />
        <h2 className="vc-h2">Agent của bạn đang chờ.</h2>
        <p className="vc-section-sub" style={{ margin: "0 auto 20px" }}>Tự host, mở rộng theo hàng ngang, không giới hạn số agent.</p>
        <div className="vc-hero-cta" style={{ justifyContent: "center" }}>
          <button className="vc-btn-primary vc-btn-lg" onClick={() => setPage("docs")}>
            Thiết lập ngay <ArrowRight size={15} />
          </button>
          <a href="https://github.com/Velclaw/Velclaw" target="_blank" rel="noreferrer" className="vc-btn-ghost vc-btn-lg">
            <Github size={15} /> Star trên GitHub
          </a>
        </div>
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  FEATURES                                                            */
/* ------------------------------------------------------------------ */

const STEPS = [
  { title: "Trình duyệt gửi yêu cầu", text: "Giao diện Velclaw không bao giờ giữ API key thật — chỉ gửi một request nghiệp vụ tới backend của bạn." },
  { title: "Backend trung gian xử lý", text: "Node.js server đọc key từ biến môi trường, gọi tới nhà cung cấp AI (Anthropic, v.v.), rồi trả kết quả về qua endpoint riêng." },
  { title: "Agent nhận kết quả, ghi log", text: "Agent tương ứng nhận phản hồi, cập nhật canvas, và mọi lượt gọi đều được ghi lại để theo dõi chi phí, lỗi, độ trễ." },
];

function FeaturesPage() {
  return (
    <section className="vc-section vc-section-top">
      <SectionEyebrow>Tính năng</SectionEyebrow>
      <h1 className="vc-h2">Ba khối chức năng, một backend chung</h1>
      <p className="vc-section-sub">
        Agent, skill và giám sát đứng độc lập nhưng chia sẻ chung một backend — mỗi khối
        mở rộng được riêng khi dự án lớn dần, không phải viết lại từ đầu.
      </p>
      <div className="vc-grid-3">
        {FEATURES.map((f) => <FeatureCard key={f.title} {...f} />)}
      </div>

      <LogoMarquee items={TECH_BADGES} />

      <div className="vc-divider" />

      <SectionEyebrow>Cách hoạt động</SectionEyebrow>
      <h2 className="vc-h2">Từ request tới kết quả, ba bước</h2>
      <div className="vc-steps">
        {STEPS.map((s, i) => (
          <div className="vc-step" key={s.title}>
            <div className="vc-step-num">{String(i + 1).padStart(2, "0")}</div>
            <div>
              <h3 className="vc-card-title">{s.title}</h3>
              <p className="vc-card-text">{s.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="vc-divider" />

      <SectionEyebrow>Triết lý</SectionEyebrow>
      <h2 className="vc-h2">Bốn nguyên tắc thiết kế</h2>
      <div className="vc-principles">
        {PRINCIPLES.map((p) => (
          <div className="vc-principle" key={p.num}>
            <span className="vc-principle-num">{p.num}</span>
            <div>
              <h3 className="vc-card-title">{p.title}</h3>
              <p className="vc-card-text">{p.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  DOCS                                                                */
/* ------------------------------------------------------------------ */

function CodeBlock({ label, code }) {
  return (
    <div className="vc-code">
      <div className="vc-code-bar"><span>{label}</span></div>
      <pre className="vc-code-body"><code>{code}</code></pre>
    </div>
  );
}

function DocsPage() {
  const env = `# Biến môi trường phía server, KHÔNG commit lên git
THIRD_PARTY_API_KEY=your_actual_key_here`;

  const server = `// Backend gọi API bên thứ 3 — key đọc từ biến môi trường
app.post('/api/chat', async (req, res) => {
  const r = await fetch('https://api.example-provider.com/v1/messages', {
    method: 'POST',
    headers: { 'Authorization': \`Bearer \${process.env.THIRD_PARTY_API_KEY}\` },
    body: JSON.stringify(req.body)
  });
  res.json(await r.json());
});`;

  return (
    <section className="vc-section vc-section-top">
      <SectionEyebrow>Tài liệu</SectionEyebrow>
      <h1 className="vc-h2">Thiết lập backend (Node.js)</h1>
      <p className="vc-section-sub">Cài biến môi trường trên server — không đưa vào commit hay file public.</p>

      <div className="vc-docs-grid">
        <CodeBlock label=".env" code={env} />
        <CodeBlock label="server.js" code={server} />
      </div>

      <div className="vc-divider" />

      <SectionEyebrow>Bảo mật API key</SectionEyebrow>
      <h2 className="vc-h2">Bốn nguyên tắc không đổi</h2>
      <ul className="vc-checklist">
        <li><Check size={15} /> Không bao giờ đặt key thật trong HTML, JS phía client, hay commit git.</li>
        <li><Check size={15} /> Luôn gọi API bên thứ 3 từ backend, trả kết quả về client qua endpoint riêng.</li>
        <li><Check size={15} /> Dùng biến môi trường (.env) và thêm vào .gitignore.</li>
        <li><Check size={15} /> Xoay vòng (rotate) key ngay nếu nghi ngờ bị lộ.</li>
      </ul>

      <div className="vc-divider" />

      <div className="vc-docs-split">
        <div>
          <SectionEyebrow>Đối tác & tích hợp</SectionEyebrow>
          <h2 className="vc-h2">Trạng thái kết nối</h2>
          <div className="vc-integrations">
            {INTEGRATIONS.map((i) => (
              <div className="vc-integration-row" key={i.name}>
                <span>{i.name}</span>
                <StatusDot status={i.status} />
              </div>
            ))}
          </div>
        </div>

        <div>
          <SectionEyebrow>Lộ trình phát triển</SectionEyebrow>
          <h2 className="vc-h2">Roadmap</h2>
          <div className="vc-roadmap">
            {ROADMAP.map((r) => (
              <div className="vc-roadmap-row" key={r.tag}>
                <span className="vc-roadmap-tag">{r.tag}</span>
                <div>
                  <div className="vc-card-title" style={{ marginBottom: 2 }}>{r.title}</div>
                  <div className="vc-card-text">{r.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="vc-divider" />

      <SectionEyebrow>Ghi chú phát triển</SectionEyebrow>
      <h2 className="vc-h2">Nhật ký quyết định kỹ thuật</h2>
      <div className="vc-notes">
        {NOTES.map((n) => (
          <article className="vc-note" key={n.tag}>
            <span className="vc-roadmap-tag">{n.tag}</span>
            <h3 className="vc-card-title" style={{ marginTop: 10 }}>{n.title}</h3>
            <p className="vc-card-text">{n.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  PRICING                                                             */
/* ------------------------------------------------------------------ */

function PricingPage({ setPage }) {
  const [faqOpen, setFaqOpen] = useState(-1);
  return (
    <section className="vc-section vc-section-top">
      <SectionEyebrow>Chi phí</SectionEyebrow>
      <h1 className="vc-h2">Tự host. Trả tiền cho những gì bạn thật sự dùng.</h1>
      <p className="vc-section-sub">
        Velclaw không bán quyền truy cập AI — bạn mang API key của chính mình, tự host backend,
        và chỉ trả tiền trực tiếp cho nhà cung cấp mô hình theo mức dùng thực tế.
      </p>

      <div className="vc-price-card">
        <div className="vc-price-top">
          <div>
            <div className="vc-eyebrow" style={{ marginBottom: 6 }}>Self-hosted</div>
            <div className="vc-price-value">Miễn phí<span>/ phần mềm</span></div>
          </div>
          <ClawMark className="vc-price-claw" />
        </div>
        <p className="vc-card-text" style={{ marginBottom: 18 }}>
          Chạy backend trên hạ tầng của bạn — VPS, máy cá nhân, hay serverless function.
          Chi phí thực tế duy nhất là mức dùng API của nhà cung cấp AI bạn chọn.
        </p>
        <ul className="vc-checklist">
          {COMPARE_ROWS.map((r) => <li key={r}><Check size={15} /> {r}</li>)}
        </ul>
        <button className="vc-btn-primary vc-btn-lg" onClick={() => setPage("docs")}>
          Thiết lập backend <ArrowRight size={15} />
        </button>
      </div>

      <div className="vc-divider" />

      <SectionEyebrow>So sánh</SectionEyebrow>
      <h2 className="vc-h2">Velclaw so với gọi API trực tiếp từ client</h2>
      <div className="vc-compare">
        <div className="vc-compare-row vc-compare-head">
          <span>Tiêu chí</span><span>Velclaw</span><span>Gọi thẳng từ client</span>
        </div>
        {[
          ["API key ẩn khỏi trình duyệt", true, false],
          ["Nhiều agent chạy song song", true, false],
          ["Log chi phí & lỗi tập trung", true, false],
          ["Không giới hạn nhà cung cấp AI", true, true],
        ].map(([label, a, b]) => (
          <div className="vc-compare-row" key={label}>
            <span>{label}</span>
            <span>{a ? <Check size={15} color="#59d99f" /> : <X size={15} color="#5a5a63" />}</span>
            <span>{b ? <Check size={15} color="#59d99f" /> : <X size={15} color="#5a5a63" />}</span>
          </div>
        ))}
      </div>

      <div className="vc-divider" />

      <SectionEyebrow>Câu hỏi thường gặp</SectionEyebrow>
      <h2 className="vc-h2">Về chi phí & vận hành</h2>
      <div className="vc-faq">
        {FAQ.slice(0, 3).map((f, i) => (
          <FAQItem key={f.q} q={f.q} a={f.a} open={faqOpen === i} onToggle={() => setFaqOpen(faqOpen === i ? -1 : i)} />
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  FOOTER                                                              */
/* ------------------------------------------------------------------ */

function Footer({ setPage }) {
  return (
    <footer className="vc-footer">
      <div className="vc-footer-top">
        <button className="vc-logo" onClick={() => setPage("home")}>
          <ClawMark className="vc-logo-mark" />
          <span>Velclaw</span>
        </button>
        <p className="vc-card-text" style={{ maxWidth: 360 }}>
          Không gian làm việc kết nối agent, skill và các API AI của bên thứ ba qua một
          backend trung gian. Tự host, mở rộng theo hàng ngang.
        </p>
        <a href="https://github.com/Velclaw/Velclaw" target="_blank" rel="noreferrer" className="vc-btn-ghost">
          <Github size={14} /> github.com/Velclaw/Velclaw
        </a>
      </div>
      <div className="vc-footer-bottom">
        <span>© 2026 Velclaw. Phiên bản v1.0.0</span>
        <span>Đây là bản phát hành đầu tiên — sẽ cập nhật dần theo phản hồi.</span>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/*  APP                                                                 */
/* ------------------------------------------------------------------ */

export default function VelclawSite() {
  const [page, setPage] = useState("home");

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [page]);

  return (
    <div className="vc-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

        .vc-root {
          --bg: #0a0a0c;
          --surface: #131316;
          --surface-2: #1b1b1f;
          --border: #26262b;
          --text-hi: #f4f3f1;
          --text-lo: #94949c;
          --accent: #9d7fff;
          --accent-soft: rgba(157,127,255,0.12);
          --accent-2: #ffb454;
          background: var(--bg);
          color: var(--text-hi);
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          min-height: 100vh;
          width: 100%;
        }
        .vc-root * { box-sizing: border-box; border-radius: 0 !important; }
        .vc-root h1, .vc-root h2, .vc-root h3, .vc-root button, .vc-root .vc-logo span { font-family: 'Space Grotesk', sans-serif; }
        .vc-root code, .vc-root pre, .vc-root .vc-mono { font-family: 'JetBrains Mono', monospace; }

        /* ---- nav ---- */
        .vc-nav { position: sticky; top: 0; z-index: 40; background: rgba(10,10,12,0.9); backdrop-filter: blur(10px); border-bottom: 1px solid var(--border); }
        .vc-nav-inner { max-width: 1100px; margin: 0 auto; padding: 12px 20px; display: flex; align-items: center; gap: 24px; }
        .vc-logo { display: flex; align-items: center; gap: 7px; background: none; border: none; color: var(--text-hi); font-weight: 700; font-size: 15px; cursor: pointer; letter-spacing: -0.01em; }
        .vc-logo-mark { width: 16px; height: 16px; }
        .vc-nav-links { display: flex; gap: 2px; flex: 1; }
        .vc-nav-link { background: none; border: none; color: var(--text-lo); font-size: 12.5px; padding: 7px 10px; cursor: pointer; transition: all .15s ease; }
        .vc-nav-link:hover { color: var(--text-hi); background: var(--surface-2); }
        .vc-nav-link.is-active { color: var(--text-hi); background: var(--accent-soft); }
        .vc-nav-cta { display: flex; align-items: center; gap: 8px; }
        .vc-nav-burger { display: none; flex-direction: column; gap: 4px; background: none; border: none; cursor: pointer; padding: 6px; }
        .vc-nav-burger span { width: 16px; height: 1.5px; background: var(--text-hi); }
        .vc-nav-mobile { display: none; }

        .vc-btn-ghost, .vc-btn-primary { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; padding: 7px 12px; cursor: pointer; text-decoration: none; white-space: nowrap; transition: all .15s ease; border: 1px solid transparent; }
        .vc-btn-ghost { color: var(--text-hi); border-color: var(--border); background: var(--surface); }
        .vc-btn-ghost:hover { border-color: #3a3a42; background: var(--surface-2); }
        .vc-btn-primary { color: #0a0a0c; background: var(--text-hi); font-weight: 600; }
        .vc-btn-primary:hover { background: var(--accent); color: #0a0a0c; }
        .vc-btn-lg { padding: 10px 16px; font-size: 13px; }

        /* ---- shared type ---- */
        .vc-eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 10.5px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--accent); margin-bottom: 8px; }
        .vc-h1 { font-size: clamp(24px, 4vw, 38px); line-height: 1.12; letter-spacing: -0.015em; font-weight: 700; margin: 14px 0 16px; }
        .vc-h2 { font-size: clamp(19px, 2.4vw, 25px); line-height: 1.2; letter-spacing: -0.01em; font-weight: 700; margin-bottom: 10px; }
        .vc-accent-text { color: var(--accent); }
        .vc-lead { color: var(--text-lo); font-size: 13.5px; line-height: 1.65; max-width: 480px; margin-bottom: 22px; }
        .vc-section-sub { color: var(--text-lo); font-size: 12.5px; line-height: 1.6; max-width: 560px; margin-bottom: 26px; }
        .vc-pill { display: inline-flex; align-items: center; gap: 5px; font-size: 10.5px; color: var(--text-lo); border: 1px solid var(--border); background: var(--surface); padding: 5px 10px; }

        /* ---- hero ---- */
        .vc-hero { max-width: 1100px; margin: 0 auto; padding: 44px 20px 16px; }
        .vc-hero-cta { display: flex; gap: 10px; flex-wrap: wrap; }
        .vc-hero-flags { display: flex; gap: 8px; margin-top: 18px; font-size: 11px; color: var(--text-lo); font-family: 'JetBrains Mono', monospace; flex-wrap: wrap; }

        /* ---- marquee ---- */
        .vc-marquee { border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); background: var(--text-hi); overflow: hidden; margin-top: 36px; }
        .vc-marquee-track { display: flex; width: max-content; animation: vc-scroll-left 22s linear infinite; }
        .vc-marquee-item { display: inline-flex; align-items: center; gap: 14px; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 500; color: #0a0a0c; padding: 10px 18px; letter-spacing: 0.02em; }
        .vc-marquee-dot { color: var(--accent); }
        @keyframes vc-scroll-left { from { transform: translateX(0); } to { transform: translateX(-50%); } }

        .vc-logomarquee { border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); overflow: hidden; margin: 40px 0; }
        .vc-logomarquee-track { display: flex; width: max-content; animation: vc-scroll-right 26s linear infinite; }
        .vc-logo-badge { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--text-lo); border-right: 1px solid var(--border); padding: 14px 22px; white-space: nowrap; }
        @keyframes vc-scroll-right { from { transform: translateX(-50%); } to { transform: translateX(0); } }

        /* ---- terminal canvas ---- */
        .vc-canvas { max-width: 1100px; margin: 28px auto 0; padding: 0 20px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
        .vc-pane { background: var(--surface); border: 1px solid var(--border); overflow: hidden; }
        .vc-pane-bar { display: flex; align-items: center; gap: 7px; padding: 7px 10px; border-bottom: 1px solid var(--border); background: var(--surface-2); }
        .vc-pane-dots { display: flex; gap: 3px; }
        .vc-pane-dots i { width: 6px; height: 6px; background: #3a3a42; display: block; }
        .vc-pane-name { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--text-lo); }
        .vc-pane-body { padding: 10px; font-family: 'JetBrains Mono', monospace; font-size: 10.5px; line-height: 1.65; min-height: 108px; }
        .vc-pane-cmd { color: var(--accent-2); margin-bottom: 5px; }
        .vc-pane-line { color: var(--text-lo); }
        .vc-caret { color: var(--accent); animation: vc-blink 1.1s step-end infinite; }
        @keyframes vc-blink { 50% { opacity: 0; } }

        /* ---- stats ---- */
        .vc-stats { max-width: 1100px; margin: 40px auto 0; padding: 20px; display: grid; grid-template-columns: repeat(4, 1fr); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
        .vc-stat { text-align: center; padding: 8px; border-left: 1px solid var(--border); }
        .vc-stat:first-child { border-left: none; }
        .vc-stat-value { font-family: 'Space Grotesk', sans-serif; font-size: 22px; font-weight: 700; color: var(--accent); }
        .vc-stat-label { font-size: 10.5px; color: var(--text-lo); margin-top: 3px; }

        /* ---- sections ---- */
        .vc-section { max-width: 1100px; margin: 0 auto; padding: 52px 20px; }
        .vc-section-tight { padding-top: 0; }
        .vc-section-top { padding-top: 40px; }
        .vc-divider { max-width: 1100px; margin: 0 auto; border-top: 1px solid var(--border); }

        .vc-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 18px; }
        .vc-card { background: var(--surface); border: 1px solid var(--border); padding: 18px; position: relative; }
        .vc-card-icon { width: 30px; height: 30px; background: var(--accent-soft); color: var(--accent); display: flex; align-items: center; justify-content: center; margin-bottom: 12px; }
        .vc-card-title { font-size: 13.5px; font-weight: 600; margin-bottom: 5px; }
        .vc-card-text { font-size: 12px; color: var(--text-lo); line-height: 1.6; }

        .vc-inline-link { background: none; border: none; color: var(--accent); font-size: 12.5px; font-weight: 500; display: inline-flex; align-items: center; gap: 5px; cursor: pointer; padding: 0; font-family: 'Space Grotesk', sans-serif; }

        /* ---- flow ---- */
        .vc-flow { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
        .vc-flow-node { flex: 1; text-align: center; padding: 13px; border: 1px solid var(--border); background: var(--surface); font-size: 12px; font-family: 'JetBrains Mono', monospace; }
        .vc-flow-node-accent { border-color: var(--accent); color: var(--accent); background: var(--accent-soft); }
        .vc-flow-arrow { color: var(--text-lo); font-size: 14px; }
        .vc-flow-caption { font-size: 11px; color: var(--text-lo); }

        /* ---- principles ---- */
        .vc-principles { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px 28px; }
        .vc-principle { display: flex; gap: 14px; }
        .vc-principle-num { font-family: 'JetBrains Mono', monospace; color: var(--accent); font-size: 20px; font-weight: 600; line-height: 1; }

        /* ---- notes ---- */
        .vc-notes { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .vc-note { background: var(--surface); border: 1px solid var(--border); padding: 16px; }

        /* ---- faq ---- */
        .vc-faq { border-top: 1px solid var(--border); }
        .vc-faq-item { border-bottom: 1px solid var(--border); }
        .vc-faq-q { width: 100%; display: flex; justify-content: space-between; align-items: center; gap: 12px; background: none; border: none; color: var(--text-hi); font-size: 13px; font-weight: 500; text-align: left; padding: 15px 2px; cursor: pointer; font-family: 'Inter', sans-serif; }
        .vc-faq-q svg { color: var(--accent); flex-shrink: 0; }
        .vc-faq-a { font-size: 12.5px; color: var(--text-lo); line-height: 1.6; padding: 0 2px 16px; max-width: 640px; }

        /* ---- cta band ---- */
        .vc-cta-band { max-width: 1100px; margin: 0 auto 52px; padding: 44px 20px; text-align: center; border: 1px solid var(--border); background: radial-gradient(circle at 50% 0%, var(--accent-soft), transparent 60%); position: relative; overflow: hidden; }
        .vc-cta-claw { position: absolute; top: 16px; right: 24px; width: 34px; height: 34px; opacity: 0.5; }

        /* ---- steps ---- */
        .vc-steps { display: flex; flex-direction: column; gap: 18px; }
        .vc-step { display: flex; gap: 14px; align-items: flex-start; }
        .vc-step-num { font-family: 'JetBrains Mono', monospace; color: var(--accent); font-size: 11.5px; border: 1px solid var(--border); padding: 4px 7px; }

        /* ---- code ---- */
        .vc-docs-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 6px; }
        .vc-code { background: var(--surface); border: 1px solid var(--border); overflow: hidden; }
        .vc-code-bar { padding: 7px 10px; border-bottom: 1px solid var(--border); background: var(--surface-2); font-size: 10.5px; color: var(--text-lo); font-family: 'JetBrains Mono', monospace; }
        .vc-code-body { margin: 0; padding: 12px; font-size: 11px; line-height: 1.6; color: #d8d6ff; overflow-x: auto; }

        .vc-checklist { list-style: none; padding: 0; margin: 0 0 22px; display: flex; flex-direction: column; gap: 8px; }
        .vc-checklist li { display: flex; align-items: flex-start; gap: 8px; font-size: 12.5px; color: var(--text-lo); }
        .vc-checklist li svg { color: var(--accent); flex-shrink: 0; margin-top: 2px; }

        .vc-docs-split { display: grid; grid-template-columns: 1fr 1fr; gap: 36px; margin-top: 6px; }
        .vc-integrations, .vc-roadmap { display: flex; flex-direction: column; gap: 8px; }
        .vc-integration-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; background: var(--surface); border: 1px solid var(--border); font-size: 12px; }
        .vc-status { display: flex; align-items: center; gap: 5px; font-size: 10.5px; color: var(--text-lo); }
        .vc-dot { width: 6px; height: 6px; display: inline-block; }
        .vc-roadmap-row { display: flex; gap: 10px; padding: 10px 12px; background: var(--surface); border: 1px solid var(--border); }
        .vc-roadmap-tag { font-family: 'JetBrains Mono', monospace; font-size: 10.5px; color: var(--accent); background: var(--accent-soft); padding: 2px 7px; height: fit-content; }

        /* ---- pricing ---- */
        .vc-price-card { background: var(--surface); border: 1px solid var(--border); padding: 26px; max-width: 500px; margin-bottom: 12px; position: relative; overflow: hidden; }
        .vc-price-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px; }
        .vc-price-value { font-size: 26px; font-weight: 700; }
        .vc-price-value span { font-size: 12px; color: var(--text-lo); font-weight: 400; margin-left: 5px; font-family: 'Inter', sans-serif; }
        .vc-price-claw { width: 30px; height: 30px; opacity: 0.4; }

        .vc-compare { border: 1px solid var(--border); overflow: hidden; }
        .vc-compare-row { display: grid; grid-template-columns: 2fr 1fr 1fr; padding: 10px 14px; font-size: 12px; border-top: 1px solid var(--border); align-items: center; color: var(--text-lo); }
        .vc-compare-row:first-child { border-top: none; }
        .vc-compare-head { background: var(--surface-2); color: var(--text-hi); font-weight: 600; font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.03em; }

        /* ---- footer ---- */
        .vc-footer { max-width: 1100px; margin: 0 auto; padding: 36px 20px 26px; border-top: 1px solid var(--border); }
        .vc-footer-top { display: flex; flex-direction: column; gap: 12px; align-items: flex-start; margin-bottom: 22px; }
        .vc-footer-bottom { display: flex; justify-content: space-between; font-size: 11px; color: var(--text-lo); flex-wrap: wrap; gap: 6px; }

        /* ---- responsive ---- */
        @media (max-width: 860px) {
          .vc-nav-links, .vc-nav-cta { display: none; }
          .vc-nav-burger { display: flex; }
          .vc-nav-mobile { display: flex; flex-direction: column; padding: 6px 20px 14px; }
          .vc-nav-mobile-link { text-align: left; background: none; border: none; color: var(--text-lo); font-size: 13px; padding: 9px 0; cursor: pointer; }
          .vc-nav-mobile-link.is-active { color: var(--accent); }
          .vc-canvas { grid-template-columns: repeat(2, 1fr); }
          .vc-stats { grid-template-columns: repeat(2, 1fr); }
          .vc-stat:nth-child(3) { border-left: none; }
          .vc-grid-3, .vc-principles, .vc-notes { grid-template-columns: 1fr; }
          .vc-docs-grid, .vc-docs-split { grid-template-columns: 1fr; }
          .vc-compare-row { grid-template-columns: 1.4fr 1fr 1fr; font-size: 11px; }
        }
        @media (max-width: 520px) { .vc-canvas { grid-template-columns: 1fr; } }
      `}</style>

      <NavBar page={page} setPage={setPage} />

      {page === "home" && <HomePage setPage={setPage} />}
      {page === "features" && <FeaturesPage />}
      {page === "docs" && <DocsPage />}
      {page === "pricing" && <PricingPage setPage={setPage} />}

      <Footer setPage={setPage} />
    </div>
  );
}