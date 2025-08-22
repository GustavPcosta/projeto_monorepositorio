# Projeto Monorepo

Este repositório contém o **backend** e o **frontend** em um monorepo, organizados em pastas separadas.  
Você pode rodar cada projeto individualmente ou ambos juntos.

---

## 📂 Estrutura do Projeto

projetos/
├── backend/
│ └── project/
├── frontend/
│ └── projeto/
└── ...

yaml
Copiar
Editar

---

## 🚀 Rodando o Backend

```bash
# Listar diretórios
dir

# Entrar na pasta principal
cd projeto
dir

# Acessar o backend
cd backend/project
Depois rode os comandos de inicialização do backend (exemplo: pnpm dev).

💻 Rodando o Frontend
bash
Copiar
Editar
# Listar diretórios
dir

# Entrar na pasta principal
cd projeto
dir

# Acessar o frontend
cd frontend/projeto
Depois rode os comandos de inicialização do frontend (exemplo: pnpm dev).

⚡ Rodando Backend e Frontend Juntos
Para rodar ambos os projetos simultaneamente:

bash
Copiar
Editar
# Entrar na pasta projetos
dir
cd projetos

# Rodar todos os apps do monorepo
pnpm -r dev
