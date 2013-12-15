 Code Craft - Forms
====================

> [Aeon Digital](http://www.aeondigital.com.br)
>
> rianna@aeondigital.com.br


**Code Craft** é um conjunto de soluções front-end e outras server-side para a construção de aplicações web.
Tais soluções aqui apresentadas são a minha forma de compartilhar com a `comunidade online` parte do que aprendi 
(e continuo aprendendo) nos foruns, sites, blogs, livros e etc. assim como na experiência adquirida no contato
direto com profissionais e estudantes que, como eu, amam o universo `Web Developer` e nunca se dão por satisfeitos 
com seu nível atual de conhecimento.


## C.C. - Forms

Namespace para verificar e manipular formulários Html.


### Métodos públicos

* `FieldElement`                : Gera uma instância "FieldElement".
* `IsValidMinOrMax`             : Testa atributo "min" e "max" do elemento alvo.
* `FieldValidate`               : Efetua a validação do campo indicado.
* `RetrieveFormPack`            : Recolhe as informações dos campos do formulário alvo e retorna um objeto FormPack.


## C.C. - Interface

**[Interface](http://github.com/AeonDigital/Code-Craft-js_Interface)** é um conjunto de funcionalidades para 
manipulação visual de elementos HTML e também de alteração de comportamentos. Os métodos aqui apresentados
somam-se ao do projeto original independente da ordem que os scripts forem carregados

* `SetActionOnEnter`            : Associa o evento informado aos Inputs do formulário alvo.
* `SetFieldTips`                : Automatiza show/hide para dicas de preenchimento de campos de formulários.
* `SetInputCounters`            : Inicia os contadores de caracteres para os campos alvo (input ou textarea).
* `SetMultipleSelectCommands`   : Seta comandos para adicionar ou remover itens selecionados entre selects multiplos.
* `SetCheckPasswordStrength`    : Testa a força de uma senha.
* `SetFormFeatures`             : Prepara os inputs do formulário alvo para utilizarem os recursos desta classe.


### Dependencias

* [Get](http://github.com/AeonDigital/Code-Craft-js_Get)
* [StringExtension](http://github.com/AeonDigital/Code-Craft-js_StringExtension)
* [WeekDate](http://github.com/AeonDigital/Code-Craft-js_WeekDate)   : Opcional
* [HashTable](http://github.com/AeonDigital/Code-Craft-js_HashTable) : Opcional
* [Labels](Labels.js)


**Importante**

Tenha em mente que em algumas vezes, neste e em outros projetos **Code Craft** optou-se de forma consciênte em 
não utilizar uma ou outra *regra de otimização* dos artefatos de software quando foi percebida uma maior vantagem para
a equipe de desenvolvimento em flexibilizar tal ponto do que extritamente seguir todas as regras de otimização.


### Compatibilidade

Não é intenção deste nem de outros projetos do conjunto de soluções **Code Craft** em manter 
compatibilidade com navegadores antigos (IE8<).


________________________________________________________________________________________________________________________



## Licença

Para este e outros projetos **Code Craft** é utilizada a [Licença GNUv3](LICENCE.md).
