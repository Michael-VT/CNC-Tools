# PCB Drill Optimizer

Otimiza o caminho de furação para fabricação de PCBs, minimizando a distância de deslocamento da máquina CNC. Parte do projeto [CNC-Tools](https://github.com/Michael-VT/CNC-Tools).

## Funcionalidades

- **Otimização de caminho** — Algoritmo Vizinho Mais Próximo + 2-opt minimiza deslocamentos não produtivos
- **Parser Excellon** — Lê ficheiros padrão Excellon NC drill (.drl, .xln, .exc)
- **Entrada manual** — Introduza coordenadas de furos e ferramentas diretamente
- **Suporte a múltiplas ferramentas** — Agrupa furos por tamanho de broca, otimiza cada grupo e minimiza trocas de ferramenta
- **Visualização** — Pré-visualização do caminho baseada em Canvas com ferramentas identificadas por cores
- **Animação** — Animação passo a passo do caminho de furação
- **Geração de G-code** — G-code padrão para furação CNC (compatível com Grbl, Mach3, LinuxCNC)
- **Saída editável** — O G-code é editável antes de guardar
- **Autónomo** — Abra `drill_optimizer.html` em qualquer navegador, sem necessidade de servidor
- **CLI Python** — Ferramenta de linha de comandos para processamento em lote

## Aplicação Web

Abra `drill_optimizer.html` num navegador. Nenhuma instalação necessária.

1. **Carregar ficheiro** — Arraste e largue um ficheiro Excellon drill, ou clique para procurar
2. **Ou introduza manualmente** — Adicione ferramentas e furos na secção "Manual Input"
3. **Otimizar** — Clique em "Optimize Path" para calcular a rota de furação mais curta
4. **Visualizar** — Alternar entre separadores: Original / Optimized / Comparison / Animation
5. **Gerar** — Defina os parâmetros de furação e clique em "Generate G-code"
6. **Editar e guardar** — Edite o G-code na área de texto, depois Copie ou faça Download do ficheiro .nc

### Captura de ecrã

![Drill Optimizer](../view02.png)

## CLI Python

```bash
cd python
python run.py ../tests/fixtures/sample_metric.drl --stats

# Com parâmetros personalizados
python run.py input.drl -o output.nc --feed 300 --plunge 80 --depth -1.8 --rpm 8000

# Pré-visualização com matplotlib
python run.py input.drl --preview
```

### Opções da CLI

| Opção | Padrão | Descrição |
|--------|---------|-------------|
| `-o, --output` | stdout | Ficheiro G-code de saída |
| `--feed` | 400 | Velocidade de avanço (mm/min) |
| `--plunge` | 100 | Velocidade de mergulho (mm/min) |
| `--depth` | -2.0 | Profundidade de furação (mm) |
| `--safe` | 20 | Altura segura de recuo (mm) |
| `--rpm` | 10000 | Velocidade do spindle (RPM) |
| `--iter` | 200 | Iterações do 2-opt |
| `--time-limit` | 5.0 | Limite de tempo de otimização (segundos) |
| `--dwell` | desligado | Adicionar pausa no fundo do furo |
| `--preview` | desligado | Mostrar pré-visualização matplotlib |
| `--stats` | desligado | Imprimir estatísticas de otimização |

## Formato de Entrada

A ferramenta aceita ficheiros Excellon NC drill — o formato padrão para dados de furação de PCBs. Funcionalidades suportadas:

- Unidades métricas (`METRIC`) e imperiais (`INCH`)
- Supressão de zeros à esquerda (`LZ`) e à direita (`TZ`)
- Definições de ferramenta: `T01C0.8` (ferramenta 1, diâmetro 0.8mm)
- Coordenadas de furos: `X1000Y2000`
- Ranhuras: `G85X...Y...X...Y...`
- Deteção automática do formato de coordenadas

## Algoritmo de Otimização

1. **Agrupar por ferramenta** — Os furos são agrupados por tamanho de broca para minimizar trocas de ferramenta
2. **Vizinho Mais Próximo** — Construção gulosa que visita os furos de cada grupo começando pelo mais próximo
3. **Melhoria 2-opt** — Troca iterativamente pares de arestas para eliminar cruzamentos no caminho
4. **Ordenação de grupos** — Os grupos de ferramentas são sequenciados para minimizar o deslocamento entre grupos

## Formato de Saída G-code

```
G21                          (Metric)
G90                          (Absolute positioning)
G00 Z20.000                  (Safe height)
T01
M06                          (Tool change)
M03 S10000                   (Spindle on)
G00 X10.000 Y5.000           (Rapid to hole)
G00 Z2.000                   (Approach)
G01 Z-2.000 F100             (Drill)
G00 Z2.000                   (Retract)
...
M05                          (Spindle off)
M30                          (End program)
```

## Executar Testes

```bash
cd drill_optimizer
python -m pytest tests/test_optimizer.py -v
```

## Estrutura do Projeto

```
drill_optimizer/
  drill_optimizer.html        Aplicação web (abrir no navegador)
  js/                         Módulos JavaScript
    excellon_parser.js        Parser de ficheiros Excellon
    drill_optimizer.js        Otimização NN + 2-opt
    gcode_generator.js        Geração de G-code
    visualization.js          Renderização Canvas + animação
    app.js                    Controlador de UI
  python/                     Ferramentas CLI Python
    excellon_parser.py        Parser
    drill_optimizer.py        Otimizador
    gcode_generator.py        Gerador de G-code
    run.py                    Ponto de entrada da CLI
  tests/                      Testes Python + fixtures
```

## Licença

Parte do projeto [CNC-Tools](https://github.com/Michael-VT/CNC-Tools).
