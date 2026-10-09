/* O Churrasqueiro · protótipo
   Dados fictícios: troque por API/banco na fase de construção. */

const PRODUTOS = [
  { id: 1, nome: "Picanha na brasa", emoji: "🥩", preco: 89.9, foto: "",
    descricao: "Picanha grelhada no ponto, fatiada na hora.",
    ingredientes: "Picanha, sal grosso.", preparo: "Grelhada em fogo alto e finalizada em brasa média." },
  { id: 2, nome: "Costela barbecue", emoji: "🍖", preco: 74.9, foto: "",
    descricao: "Costela macia com molho defumado.",
    ingredientes: "Costela bovina, molho barbecue da casa.", preparo: "Assada lentamente por 6 horas e passada na grelha." },
  { id: 3, nome: "Linguiça artesanal", emoji: "🌭", preco: 32.9, foto: "",
    descricao: "Linguiça suína temperada, suculenta.",
    ingredientes: "Carne suína, ervas, alho.", preparo: "Grelhada até dourar por igual." },
  { id: 4, nome: "Frango na brasa", emoji: "🍗", preco: 44.9, foto: "",
    descricao: "Coxa e sobrecoxa marinadas no limão.",
    ingredientes: "Coxa, sobrecoxa, limão, alho, páprica.", preparo: "Marinada por 12 horas e assada na brasa." },
  { id: 5, nome: "Pão de alho", emoji: "🥖", preco: 14.9, foto: "",
    descricao: "Pão crocante com manteiga de alho.",
    ingredientes: "Pão, manteiga, alho, salsa.", preparo: "Tostado na grelha até dourar." },
  { id: 6, nome: "Farofa da casa", emoji: "🥣", preco: 12.9, foto: "",
    descricao: "Farofa crocante com bacon e cebola.",
    ingredientes: "Farinha de mandioca, bacon, cebola, manteiga.", preparo: "Refogada na manteiga até ficar dourada." },
];

const $ = (s) => document.querySelector(s);
const moeda = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/* ---------- Estado da sacola ---------- */
let sacola = [];
try { sacola = JSON.parse(localStorage.getItem("sacola")) || []; } catch (e) { sacola = []; }
const salvar = () => { try { localStorage.setItem("sacola", JSON.stringify(sacola)); } catch (e) {} };
const produto = (id) => PRODUTOS.find((p) => p.id === id);

function fotoHTML(p) {
  return p.foto ? `<img src="${p.foto}" alt="${p.nome}">` : p.emoji;
}

/* ---------- Navegação por hash ---------- */
function rota() {
  const alvo = location.hash.slice(1) || "home";
  document.querySelectorAll("[data-tela]").forEach((t) => (t.hidden = t.id !== alvo));
  document.querySelectorAll(".topo nav a").forEach((a) =>
    a.classList.toggle("ativo", a.getAttribute("href") === "#" + alvo));
  if (alvo === "sacola") renderSacola();
  window.scrollTo(0, 0);
}
window.addEventListener("hashchange", rota);

/* ---------- Cardápio ---------- */
function renderCardapio() {
  $("#lista-produtos").innerHTML = PRODUTOS.map((p) => `
    <li>
      <button class="item" type="button" data-id="${p.id}">
        <div class="foto">${fotoHTML(p)}</div>
        <div><h3>${p.nome}</h3><p>${p.descricao}</p></div>
        <span class="preco">${moeda(p.preco)}</span>
      </button>
    </li>`).join("");
}

let abertoId = null;
function abrirPopup(id) {
  const p = produto(id);
  abertoId = id;
  $("#pp-foto").innerHTML = fotoHTML(p);
  $("#pp-nome").textContent = p.nome;
  $("#pp-descricao").textContent = p.descricao;
  $("#pp-ingredientes").textContent = p.ingredientes;
  $("#pp-preparo").textContent = p.preparo;
  $("#pp-preco").textContent = moeda(p.preco);
  $("#popup-produto").showModal();
}

$("#lista-produtos").addEventListener("click", (e) => {
  const item = e.target.closest(".item");
  if (item) abrirPopup(Number(item.dataset.id));
});

$("#pp-adicionar").addEventListener("click", () => {
  sacola.push({ id: abertoId });
  salvar();
  atualizarContador();
  $("#popup-produto").close();
});

/* ---------- Sacola ---------- */
function atualizarContador() { $("#qtd-sacola").textContent = sacola.length; }

function renderSacola() {
  const vazia = sacola.length === 0;
  $("#sacola-vazia").hidden = !vazia;
  $("#finalizar").disabled = vazia;
  $("#lista-sacola").innerHTML = sacola.map((item, i) => {
    const p = produto(item.id);
    return `<li>
      <div class="foto">${fotoHTML(p)}</div>
      <span>${p.nome}</span>
      <span class="preco">${moeda(p.preco)}</span>
      <button class="lixeira" type="button" data-i="${i}" aria-label="Remover ${p.nome}">🗑</button>
    </li>`;
  }).join("");
  $("#total").textContent = moeda(sacola.reduce((s, it) => s + produto(it.id).preco, 0));
}

$("#lista-sacola").addEventListener("click", (e) => {
  const b = e.target.closest(".lixeira");
  if (!b) return;
  sacola.splice(Number(b.dataset.i), 1);
  salvar(); atualizarContador(); renderSacola();
});

$("#finalizar").addEventListener("click", () => {
  const msg = $("#msg-pedido");
  if (!$("#endereco").value.trim()) {
    msg.textContent = "Informe o endereço de entrega para finalizar o pedido.";
    msg.hidden = false;
    $("#endereco").focus();
    return;
  }
  msg.textContent = "Pedido enviado! Você receberá cada etapa pelo WhatsApp.";
  msg.hidden = false;
  sacola = []; salvar(); atualizarContador(); renderSacola();
});

/* ---------- Calculadora de carnes: 400 g adulto, 200 g criança ---------- */
function calcular() {
  const a = Math.max(0, Number($("#adultos").value) || 0);
  const c = Math.max(0, Number($("#criancas").value) || 0);
  const g = a * 400 + c * 200;
  $("#resultado-calc").textContent = g >= 1000 ? (g / 1000).toLocaleString("pt-BR") + " kg" : g + " g";
}
$("#adultos").addEventListener("input", calcular);
$("#criancas").addEventListener("input", calcular);

/* ---------- Popups: login e fechar ---------- */
$("#abrir-login").addEventListener("click", () => $("#popup-login").showModal());
document.querySelectorAll("dialog").forEach((d) => {
  d.addEventListener("click", (e) => {
    if (e.target === d || e.target.closest("[data-fechar]")) d.close();
  });
});

/* ---------- Início ---------- */
renderCardapio();
atualizarContador();
calcular();
rota();
