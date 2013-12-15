/**
* @package Code Craft
* @pdesc Conjunto de soluções front-end.
*
* @module Labels
* @file Objeto que traz legendas pt-br.
*
* @author Rianna Cantarelli <rianna.aeon@gmail.com>
*/















// Caso o Objeto Labels ainda não exista... cria-o
if (typeof (Labels) === 'undefined') { var Labels = {}; }








/**
* Legendas pt-br.
*
* @class Labels
*
* @global
*
* @static
*
* @type {Class}
*/
(function () {



    var newLabels = {
        /**
        * Mensagem para senhas que contenham caracteres inválidos.
        *
        * @memberof Labels
        *
        * @type {String}
        */
        PasswordInvalidChar: 'Caracter Inválido digitado: {chars}',
        /**
        * Mensagem para senhas muito curtas.
        *
        * @memberof Labels
        *
        * @type {String}
        */
        PasswordShort: 'Senha muito curta',
        /**
        * Mensagem para senhas muito fraca.
        *
        * @memberof Labels
        *
        * @type {String}
        */
        PasswordVeryWeak: 'Senha muito fraca',
        /**
        * Mensagem para senhas fraca.
        *
        * @memberof Labels
        *
        * @type {String}
        */
        PasswordWeak: 'Senha fraca',
        /**
        * Mensagem para senhas relevante.
        *
        * @memberof Labels
        *
        * @type {String}
        */
        PasswordRelevant: 'Senha relevante',
        /**
        * Mensagem para senhas forte.
        *
        * @memberof Labels
        *
        * @type {String}
        */
        PasswordStrong: 'Senha forte',
        /**
        * Mensagem para senhas muito forte.
        *
        * @memberof Labels
        *
        * @type {String}
        */
        PasswordVeryStrong: 'Senha muito forte',







        /**
        * Título para alertas de falha ao preenchimento de algum campo de formulário.
        *
        * @memberof Labels
        *
        * @type {String}
        */
        FormErrorTitleAlert: 'Preencha corretamente os seguintes campos:',
        /**
        * Mensagem genérica para um campo inválido.
        *
        * @memberof Labels
        *
        * @type {String}
        */
        FieldError: 'Preencha corretamente o campo "{label}".',
        /**
        * Mensagem para campo que deve ser preenchido.
        *
        * @memberof Labels
        *
        * @type {String}
        */
        FieldValueEmpty: 'O campo "{label}" deve ser preenchido.',
        /**
        * Mensagem para campo que está com valor inválido.
        *
        * @memberof Labels
        *
        * @type {String}
        */
        FieldInvalidValue: 'O conteúdo do campo "{label}" não é válido.',
        /**
        * Mensagem para campo select onde nenhuma opção está selecionada.
        *
        * @memberof Labels
        *
        * @type {String}
        */
        FieldSelectOne: 'Você deve selecionar uma opção do campo "{label}".'
    };


    // Adiciona labels locais aos labels globais
    for (var it in newLabels) { Labels[it] = newLabels[it]; }
})();
