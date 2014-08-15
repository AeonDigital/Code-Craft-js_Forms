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

**Forms** permite que inúmeros novos controles sejam adicionados aos campos de formulário
facilitando seu preenchimento, validação e formatação.



### Métodos e Objetos.

* `ValidateErrorLabels`         : Objeto contendo legendas para mensagens amigaveis de validação.
* `CreateFormType`              : Cria um objeto "ComplexType" para uso em formulários.
* `AddNewCollection`            : Adiciona uma nova coleção de tipos complexos ao rol de possibilidades.
* `ConnectFields`               : Conecta os campos marcados com seus respectivos objetos "ComplexType".
* `CheckAndFormatField`         : Efetua verificação do campo a partir do seu respectivo "ComplexType".
* `CheckFields`                 : Valida todos os campos encontrados para o formulário alvo.
* `SetActionOnEnter`            : Prepara os campos para dispararem uma ação não padrão ao pressionar Enter.



#### Dependências

As seguintes bibliotecas são necessárias :

* [BasicTools](http://github.com/AeonDigital/Code-Craft-js_BasicTools)
* [BasicDOM](http://github.com/AeonDigital/Code-Craft-js_BasicDOM)
* [ComplexType](http://github.com/AeonDigital/Code-Craft-js_ComplexType)
* [StringExtension](http://github.com/AeonDigital/Code-Craft-js_StringExtension) - Opcional, porém, recomendável.


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
