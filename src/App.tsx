import React, { useState, useEffect } from 'react';
import { Code2, Moon, Sun, BookOpen, Trophy, Brain } from 'lucide-react';
import MistralClient from '@mistralai/mistralai';
import Editor from "@monaco-editor/react";

// Linguagens suportadas para os exercícios
const LINGUAGENS = ['React', 'Python', 'JavaScript', 'PHP', 'C++', 'TypeScript'];

// Níveis de dificuldade disponíveis
const DIFICULDADES = [
  { id: 'iniciante', nome: 'Iniciante', icon: BookOpen },
  { id: 'intermediario', nome: 'Intermediário', icon: Brain },
  { id: 'avancado', nome: 'Avançado', icon: Trophy }
];

// Inicialização do cliente Mistral AI
const mistral = new MistralClient(import.meta.env.VITE_MISTRAL_API_KEY);

function App() {
  // Estados para controle da aplicação
  const [linguagem, setLinguagem] = useState('JavaScript');
  const [dificuldade, setDificuldade] = useState('iniciante');
  const [exercicio, setExercicio] = useState('');
  const [codigo, setCodigo] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [temaEscuro, setTemaEscuro] = useState(false);
  const [mensagemErro, setMensagemErro] = useState('');
  const [preview, setPreview] = useState('');

  // Efeito para atualizar o preview quando o código muda
  useEffect(() => {
    atualizarPreview(codigo);
  }, [codigo]);

  // Função para alternar o tema
  const alternarTema = () => {
    setTemaEscuro(!temaEscuro);
  };

  // Função para gerar um novo exercício
  const gerarExercicio = async () => {
    setCarregando(true);
    setMensagemErro('');
    
    try {
      const chatResponse = await mistral.chat({
        model: "mistral-tiny",
        messages: [
          {
            role: "system",
            content: "Você é um professor de programação especializado em criar exercícios práticos."
          },
          {
            role: "user",
            content: `
              Crie um exercício de programação com as seguintes características:
              - Linguagem: ${linguagem}
              - Nível: ${dificuldade}
              
              O exercício deve incluir:
              1. Um título descritivo
              2. Descrição detalhada do problema
              3. Exemplos de entrada e saída esperada
              4. Dicas úteis para iniciantes
              5. Um template inicial de código para o aluno começar
              
              Formate a resposta de forma clara e organizada.
            `
          }
        ]
      });

      const exercicioGerado = chatResponse.choices[0].message.content;
      setExercicio(exercicioGerado);
      
      // Extrair o template inicial do exercício
      const templateMatch = exercicioGerado.match(/```[^\n]*\n([\s\S]*?)```/);
      if (templateMatch) {
        setCodigo(templateMatch[1].trim());
      }
    } catch (erro: any) {
      console.error('Erro ao gerar exercício:', erro);
      setMensagemErro('Ocorreu um erro ao gerar o exercício. Por favor, tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  // Função para atualizar o preview do código
  const atualizarPreview = async (novoCodigo: string) => {
    if (!novoCodigo.trim()) {
      setPreview('');
      return;
    }

    try {
      const chatResponse = await mistral.chat({
        model: "mistral-tiny",
        messages: [
          {
            role: "system",
            content: "Você é um avaliador de código que fornece feedback sobre a implementação."
          },
          {
            role: "user",
            content: `
              Analise este código em ${linguagem} e forneça:
              1. O resultado esperado da execução
              2. Se houver, problemas potenciais ou melhorias sugeridas
              
              Código:
              ${novoCodigo}
            `
          }
        ]
      });

      setPreview(chatResponse.choices[0].message.content);
    } catch (erro) {
      console.error('Erro ao atualizar preview:', erro);
      setPreview('Erro ao gerar preview do código');
    }
  };

  return (
    <div className={`min-h-screen ${temaEscuro ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Cabeçalho */}
      <header className={`${temaEscuro ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Code2 className={`h-6 w-6 ${temaEscuro ? 'text-indigo-400' : 'text-indigo-600'}`} />
            <h1 className={`text-xl font-semibold ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>
              Exercícios de Programação
            </h1>
          </div>
          <button
            onClick={alternarTema}
            className={`p-2 rounded-md ${
              temaEscuro
                ? 'bg-gray-700 hover:bg-gray-600'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {temaEscuro ? (
              <Sun className="h-5 w-5 text-yellow-400" />
            ) : (
              <Moon className="h-5 w-5 text-gray-600" />
            )}
          </button>
        </div>
      </header>

      {/* Configurações do exercício */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className={`mb-6 p-6 rounded-lg ${temaEscuro ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Seleção de linguagem */}
            <div>
              <label className={`block text-sm font-medium ${temaEscuro ? 'text-gray-200' : 'text-gray-700'} mb-2`}>
                Linguagem de Programação
              </label>
              <select
                value={linguagem}
                onChange={(e) => setLinguagem(e.target.value)}
                className={`block w-full rounded-md shadow-sm sm:text-sm ${
                  temaEscuro
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-indigo-500'
                    : 'border-gray-300 focus:border-indigo-500'
                }`}
              >
                {LINGUAGENS.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>

            {/* Seleção de dificuldade */}
            <div>
              <label className={`block text-sm font-medium ${temaEscuro ? 'text-gray-200' : 'text-gray-700'} mb-2`}>
                Nível de Dificuldade
              </label>
              <div className="grid grid-cols-3 gap-2">
                {DIFICULDADES.map(({ id, nome, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setDificuldade(id)}
                    className={`flex items-center justify-center p-2 rounded-md ${
                      dificuldade === id
                        ? 'bg-indigo-600 text-white'
                        : temaEscuro
                        ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {nome}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Botão gerar exercício */}
          <button
            onClick={gerarExercicio}
            disabled={carregando}
            className={`mt-6 w-full py-2 px-4 rounded-md text-white font-medium ${
              carregando
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {carregando ? 'Gerando exercício...' : 'Gerar Novo Exercício'}
          </button>
        </div>

        {mensagemErro && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {mensagemErro}
          </div>
        )}

        {exercicio && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Descrição do exercício */}
            <div className={`rounded-lg shadow-sm ${temaEscuro ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`p-4 border-b ${temaEscuro ? 'border-gray-700' : 'border-gray-200'}`}>
                <h2 className={`text-lg font-medium ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>
                  Exercício
                </h2>
              </div>
              <div className="p-4">
                <div 
                  className={`prose ${temaEscuro ? 'prose-invert' : ''} max-w-none`}
                  style={{ whiteSpace: 'pre-wrap' }}
                >
                  {exercicio}
                </div>
              </div>
            </div>

            {/* Editor e Preview */}
            <div className="space-y-6">
              {/* Editor de código */}
              <div className={`rounded-lg shadow-sm ${temaEscuro ? 'bg-gray-800' : 'bg-white'}`}>
                <div className={`p-4 border-b ${temaEscuro ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h2 className={`text-lg font-medium ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>
                    Seu Código
                  </h2>
                </div>
                <div className="p-4">
                  <Editor
                    height="400px"
                    defaultLanguage={linguagem.toLowerCase()}
                    theme={temaEscuro ? 'vs-dark' : 'light'}
                    value={codigo}
                    onChange={(value) => setCodigo(value || '')}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: 'on',
                      automaticLayout: true,
                    }}
                  />
                </div>
              </div>

              {/* Preview do código */}
              <div className={`rounded-lg shadow-sm ${temaEscuro ? 'bg-gray-800' : 'bg-white'}`}>
                <div className={`p-4 border-b ${temaEscuro ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h2 className={`text-lg font-medium ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>
                    Preview
                  </h2>
                </div>
                <div className="p-4">
                  <pre className={`whitespace-pre-wrap ${temaEscuro ? 'text-gray-200' : 'text-gray-700'}`}>
                    {preview}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;