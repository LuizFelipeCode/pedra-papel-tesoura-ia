

:: Navega até a pasta do front-end
cd .\front-end\

:: Inicia o front-end
start cmd /k "npm run dev"

:: Retorna ao diretório principal
cd ..

:: Navega até a pasta do back-end
cd .\back-end\

:: Inicia o back-end
start cmd /k "uvicorn app.main:app --reload"