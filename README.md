# Português

# API Bíblia para Humanos
### Escreva referências do jeito que quiser, e receba de volta os textos bíblicos.
    
O API Bíblia para Humanos é um API rest capaz de entender referências bíblicas escritas de uma forma não rígida, na linguagem natural em que pessoas escrevem as referências, com diferentes convenções e caracteres de separação. Além disso, ele é capaz de ler mútiplas referências combinadas, para que os usuários possam pesquisar textos bíblicos de maneira rápida e sem dor de cabeça.

URL: https://www.bibliaparahumanos.tk/

## Exemplos de Queries

**servicos**: Você pode obter a lista de serviços fornecidos.

**versoes**: Bem como a lista de versões da bíblia disponíveis no API.

**texto/Marcos 1:1-5**: Você pode escrever o nome do livro completo com capítulo e intervalo de versículos.

**texto/João 1/acf**: Você pode definir a versão do texto (por padrão é NVI).

**texto/lc1**: Também pode escrever o nome do livro de forma abreviada.

**texto/Gensis 1**: Ou até errada (dentro do razoável).

**texto/Jon1.5,mt2:1-3; nm1**: Você pode incluir várias referências na mesma chamada. A separação de capítulo e versículo pode ser por ponto (.) ou dois pontos (\:), e a separação de referências pode ser por vírgula (,) ou ponto e vírgula (\;).

**texto/Deut 7:1-5, 9, 8:10**: Quando duas referências são do mesmo livro ou capítulo, você pode omitir o nome do livro ou capítulo das referências seguintes.

**texto/Lc3:1-5, x1, num10:5**: Se uma das referências for inválida, isso não atrapalha o restante do resultado.
        
# English 

# Bible API for Humans
### Write references however you want, and get bible texts in return.
    
The Bible API for Humans is a RESTful API capable of understanding bible references written in a non-rigid way, in natural language as people usually write references, with different conventions and separator characters. It is also capable of reading multiple chained references, to allow users to search bible texts fast and with no headache.

## Query Examples

**servicos**: You can get the list of services provided.

**versoes**: As well as the list of bible versions available.

**texto/Marcos 1:1-5**: You can write the book\'s whole name with chapter and verse.

**texto/João 1/acf**: You can set the bible version (default is NIV).

**texto/lc1**: You may also write the book\'s name in an abbreviated way.

**texto/Gensis 1**: Or even mispell it (within a reasonable margin).

**texto/Jon1.5,mt2:1-3; nm1**: You may include multiple references in a single call. The separator for chapter and verse may be a dot (.) or a colon (\:), and the separator for multiple references may be a comma (,) or a semi-colon (\;).

**texto/Deut 7:1-5, 9, 8:10**: When two chained references are for the same book or chapter, you can ommit the book or chapter for the following references.

**texto/Lc3:1-5, x1, num10:5**: If one of the references is invalid, that doesn\'t invalidate the remainder of the request.