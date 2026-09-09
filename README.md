# Event Sales Hub

# Prompt para o Lovable — App de Controle de Vendas de Blusas/Camisas



## Objetivo do app

Criar um aplicativo web para controlar vendas de blusas e camisas em um evento pontual, substituindo uma planilha Excel. O app deve ser simples e rápido de usar no celular durante o evento, com os dados salvos na nuvem, para que várias pessoas possam registrar vendas ao mesmo tempo, de dispositivos diferentes, vendo os mesmos números em tempo real.



## Modelo de dados (tabela "vendas")

Cada venda registrada deve conter:

- id (gerado automaticamente)

- nome_cliente (texto, obrigatório)

- genero (seleção: Masculino / Feminino)

- tamanho (seleção: PP, P, M, G, GG, XG)

- quantidade (número inteiro, mínimo 1)

- valor_unitario (número decimal, em R$)

- valor_total (calculado automaticamente = quantidade × valor_unitario)

- pago (sim/não — toggle ou checkbox)

- forma_pagamento (seleção: Dinheiro, Pix, Cartão de Débito, Cartão de Crédito — só fica habilitada/obrigatória se "pago" = sim)

- observacao (texto opcional, para anotações extras)

- data_hora (timestamp automático de criação do registro)



## Telas e funcionalidades



### 1. Formulário de novo cadastro

- Formulário simples, otimizado para celular, com poucos campos por tela/toque

- Ao salvar, o registro aparece imediatamente na lista abaixo, sem precisar recarregar a página

- Validações: nome do cliente obrigatório; quantidade e valor não podem ser zero ou negativos



### 2. Lista/tabela de vendas

- Registros ordenados do mais recente para o mais antigo

- Permitir editar e excluir cada registro

- Indicação visual clara de status: "Pago" (verde) e "Pendente" (vermelho/laranja)

- Busca por nome do cliente

- Filtros por: pago/não pago, gênero, tamanho, forma de pagamento



### 3. Painel de resumo, atualizado automaticamente

Deve recalcular em tempo real a cada novo cadastro, edição ou exclusão:

- Valor total arrecadado (soma geral)

- Valor total já recebido (soma dos pagos)

- Valor total pendente (soma dos não pagos)

- Quantidade total de peças vendidas

- Quantidade de peças por tamanho (ex: PP: x, P: x, M: x...)

- Quantidade por gênero (masculino x feminino)

- Total recebido por forma de pagamento (Pix: R$x, Dinheiro: R$x, Cartão: R$x)

- Número de clientes atendidos



### 4. Exportação

- Botão para exportar todos os registros em CSV, como backup ou conferência posterior



## Requisitos técnicos

- Persistência em banco de dados na nuvem (Supabase), não em localStorage — precisa funcionar com múltiplos dispositivos acessando e atualizando os mesmos dados ao mesmo tempo

- Atualização em tempo real (ou quase) entre dispositivos conectados

- Interface responsiva, priorizando o uso em smartphone (é onde o cadastro vai acontecer, durante o evento)

- Sem necessidade de login complexo; se quiser alguma proteção, uma senha simples de acesso ao painel é suficiente (opcional)



## Design

- Visual limpo, moderno e leve

- Cores neutras, com destaque de cor para os status "pago"/"pendente"

- Botão de "novo cadastro" sempre visível e de fácil acesso (ex: botão flutuante)

- Números do painel de resumo em destaque, fáceis de ler rapidamente durante o corre do evento

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/4abd7ecc-d8ae-47d9-acf3-70e054c06da4).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
