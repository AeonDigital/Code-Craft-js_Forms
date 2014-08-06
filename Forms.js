/**
* @package Code Craft
* @pdesc Conjunto de soluções front-end.
*
* @module Forms
* @file Forms.
*
* @author Rianna Cantarelli <rianna.aeon@gmail.com>
*/







// --------------------
// Caso não exista, inicia objeto CodeCraft
var CodeCraft = (CodeCraft || function () { });
if(typeof(CodeCraft) === 'function') { CodeCraft = new CodeCraft(); };






/**
* Classe que contém melhorias para utilizar em campos de formulários.
*
* @class Forms
*
* @memberof CodeCraft
*
* @static
*
* @type {Class}
*/
CodeCraft.Forms = new (function () {
    var _bt = CodeCraft.BasicTools;
    var _dom = CodeCraft.BasicDOM;
    var _ct = CodeCraft.ComplexType;







    /* ----------
    EXEMPLO DE MARCAÇÃO PARA CONECTAR UM CAMPO NO HTML À UM OBJETO "ComplexType"


    1 - HTML

    Atributos especiais
    data-complextype        :       Indica qual objeto "ComplexType" controla a validação e formatação do campo.
    data-valid              :       Indica se o campo é válido [true] ou não [false]
    data-validate           :       Indica se é para validar o campo ou não [true|false]


    <form action="index.html" method="post" novalidate="novalidate">
        <div>
            <label for="ViewForm_FullName">Nome</label>
            <input type="text" id="ViewForm_FullName" name="ViewForm_FullName" class="iCommom small-fix"
                data-complextype="ViewForm.FullName"
                title="Nome" />
        </div>

        <div>
            <label for="ViewForm_Email">Email</label>
            <input type="text" id="ViewForm_Email" name="ViewForm_Email" class="iCommom"
                data-complextype="ViewForm.Email"
                title="Email" />
        </div>

        <div>
            <label for="ViewForm_Mensagem">Mensagem</label>
            <input type="text" id="ViewForm_Mensagem" name="ViewForm_Mensagem" class="iCommom"
                data-complextype="ViewForm.Mensagem"
                title="Mensagem" />
        </div>
    </form>



    2 - JAVASCRIPT

    O código abaixo registra os tipos complexos utilizados pelos campos do formulário.


    CodeCraft.Forms.AddNewCollection('ViewForm', [
        CodeCraft.Forms.CreateFormType('FullName', 'String', 64, null, null, null, false, null, null),
        CodeCraft.Forms.CreateFormType('Email', 'String', null, null, null, null, false, null, String.Pattern.World.Email),
        CodeCraft.Forms.CreateFormType('Mensagem', 'String', null, null, null, null, false, null, null)
    ]);

    
    CodeCraft.Forms.ConnectFields();



    ---------- */










    /**
    * Objeto resultante da validação de um formulário.
    * 
    * @typedef {ValidateFormResult}
    *
    * @property {Node}                      Field                           Elemento que falhou.
    * @property {ValidateError}             ErrorType                       Tipo do erro de validação.
    * @property {String}                    Message                         Mensagem de erro amigável.
    */


















    /*
    * PROPRIEDADES PRIVADAS
    */



    /**
    * Agrupa todas as coleções de "ComplexType" que podem ser usados nas validações.
    *
    * @type {Object[Key/ComplexType[]))
    */
    var _complexTypes = {};





















    /*
    * MÉTODOS PRIVADOS
    */



    /**
    * Tipos de erros para a validação de campos de formulários.
    *
    * @memberof Forms
    *
    * @enum ValidateError
    *
    * @type {String}
    *
    * @readonly
    */
    var ValidateError = {
        /** 
        * Valor do atributo "data-complextype" é inválido. 
        *
        * @memberof ValidateError
        */
        InvalidComplexType: 'InvalidComplexType',
        /**
        * "ComplexType" não existe.
        *
        * @memberof ValidateError
        */
        ComplexTypeDoesNotExist: 'ComplexTypeDoesNotExist',
        /**
        * Valor obrigatorio não foi informado.
        *
        * @memberof ValidateError
        */
        RequiredValueNotSet: 'RequiredValueNotSet',
        /**
        * Valor informado é inválido.
        *
        * @memberof ValidateError
        */
        InvalidValue: 'InvalidValue',
        /**
        * Tipo do valor é inválido.
        *
        * @memberof ValidateError
        */
        InvalidType: 'InvalidType',
        /**
        * O valor informado é maior que o tamanho do campo.
        *
        * @memberof ValidateError
        */
        MaxLengthExceeded: 'MaxLengthExceeded',
        /**
        * O valor informado excedeu os limites definidos.
        *
        * @memberof ValidateError
        */
        ValueOutOfRange: 'ValueOutOfRange',
        /**
        * Algum valor deve ser selecionado.
        *
        * @memberof ValidateErrorLabels
        */
        ValueNotSelected: 'ValueNotSelected'
    };










    /**
    * Retorna o objeto "ComplexType" selecionado.
    *
    * @function _selectComplexType
    *
    * @param {String}                       collection                      Nome da coleção.
    * @param {String}                       ctName                          Nome do tipo que será selecionado.
    *
    * @return {!ComplexType}
    */
    var _selectComplexType = function (collection, ctName) {
        var r = null;

        for (var it in _complexTypes) {
            if (it == collection) {
                var ct = _complexTypes[it];

                for (var n in ct) {
                    if (ct[n].Name == ctName) { r = ct[n]; break; }
                }

                break;
            }
        }

        return r;
    };



    /**
    * Resgata o nome pelo qual o campo é chamado.
    * 
    * @function _getFieldName
    *
    * @private
    *
    * @param {Node}                         f                               Campo cujo nome será identificado.
    *
    * @return {String}
    */
    var _getFieldName = function (f) {
        var n = '';

        if (f.hasAttribute('title')) {
            n = f.getAttribute('title');
        }
        else if (f.hasAttribute('id')) {
            var l = _dom.Get('label[for="' + f.id + '"]');
            if (l !== null) {
                n = l[0].textContent;
            }
        }

        if (n == '' && f.hasAttribute('name')) {
            n = f.getAttribute('name');
        }

        return n;
    };

















    /**
    * OBJETO PÚBLICO QUE SERÁ EXPOSTO.
    */
    var public = this.Control = {
        /**
        * Legendas para mensagens de erro amigáveis.
        *
        * @memberof Forms
        *
        * @enum ValidateErrorLabels
        *
        * @type {String}
        */
        ValidateErrorLabels: {
            /**
            * Título para alertas de falha ao preenchimento de algum campo de formulário.
            *
            * @memberof ValidateErrorLabels
            *
            * @type {String}
            */
            FormErrorTitleAlert: 'The following errors were found:',
            /** 
            * Valor do atributo "data-complextype" é inválido. 
            *
            * @memberof ValidateErrorLabels
            */
            InvalidComplexType: 'The value "{label}" of attribute "data-complextype" is invalid.',
            /**
            * ComplexType definido não existe.
            *
            * @memberof ValidateErrorLabels
            */
            ComplexTypeDoesNotExist: 'Table or column does not exist.\n[data-complextype="{label}"]',
            /**
            * Valor obrigatorio não foi informado.
            *
            * @memberof ValidateErrorLabels
            */
            RequiredValueNotSet: 'The field "{label}" must be filled.',
            /**
            * Valor informado é inválido.
            *
            * @memberof ValidateErrorLabels
            */
            InvalidValue: 'Properly fill the field "{label}".',
            /**
            * Tipo do valor é inválido.
            *
            * @memberof ValidateErrorLabels
            */
            InvalidType: 'Properly fill the field "{label}".',
            /**
            * O valor informado é maior que o tamanho do campo.
            *
            * @memberof ValidateErrorLabels
            */
            MaxLengthExceeded: 'The field "{label}" is too long.',
            /**
            * O valor informado excedeu os limites definidos.
            *
            * @memberof ValidateErrorLabels
            */
            ValueOutOfRange: 'The value of field "{label}" is out of range',
            /**
            * Mensagem para campo select onde nenhuma opção está selecionada.
            *
            * @memberof ValidateErrorLabels
            */
            ValueNotSelected: 'You must select an option from the field "{label}".'
        },










        /**
        * Cria um objeto "ComplexType" sem precisar informar dados desnecessários para campos
        * comuns de formulário.
        * 
        * @function CreateFormType
        *
        * @memberof Forms
        *
        * @param {String}                   parName                         Nome do tipo.
        * @param {PrimitiveType}            parType                         Tipo de dado primitivo aceito.
        * @param {Integer}                  [parLength = null]              Tamanho máximo para um campo do tipo String.
        * @param {Integer}                  [parMin = null]                 Valor mínimo aceito para um campo numérico.
        * @param {Integer}                  [parMax = null]                 Valor máximo aceito para um campo numérico.
        * @param {String}                   [parRefType = null]             Nome do tipo ao qual este deve ser uma referência.
        * @param {Boolean}                  [parAllowEmpty = false]         Indica se permite que o valor seja vazio [''].
        * @param {String}                   [parDefault = null]             Valor inicial para uma variável deste tipo.
        * @param {DataFormat}               [parFormatSet = null]           Objeto de definições para formatação.
        *
        * @return {!ComplexType}
        */
        CreateFormType: function (parName, parType, parLength, parMin, parMax,
                                            parRefType, parAllowEmpty, parDefault, parFormatSet) {

            return _ct.CreateNewType(parName, parType, parLength, parMin, parMax, parRefType,
                                            true, true, parAllowEmpty, false, false, parDefault, parFormatSet);
        },









        /**
        * Adiciona uma nova coleção de tipos complexos ao rol de possibilidades.
        * 
        * @function AddNewCollection
        *
        * @memberof Forms
        *
        * @param {String}                   name                            Nome da coleção.
        * @param {ComplexType[]}            collection                      Coleção de elementos.
        *
        * @return {Boolean}
        */
        AddNewCollection: function (name, collection) {
            var r = true;

            for (var it in _complexTypes) {
                if (it == name) { r = false; break; }
            }

            if (r) {
                _complexTypes[name] = collection;
            }

            return r;
        },





        /**
        * Conecta os campos marcados com seus respectivos objetos "ComplexType".
        * 
        * @function ConnectFields
        *
        * @memberof Forms
        */
        ConnectFields: function () {
            var tgtInputs = _dom.Get('input, textarea, select');
            var isOk = true;
            var d = true;


            for (var it in tgtInputs) {
                var f = tgtInputs[it];

                if (isOk && f.hasAttribute('data-complextype')) {
                    var dbfn = f.getAttribute('data-complextype');
                    var cType = null;

                    // Nome da Tabela e Coluna que o campo deve representar
                    var fn = dbfn.split('.');
                    if (fn.length != 2) {
                        console.log('Input has an invalid value for attribute "data-complextype". Found "' + dbfn + '".');
                        isOk = false;
                    }
                    else {
                        cType = _selectComplexType(fn[0], fn[1]);
                        if (cType != null) {
                            isOk = true;
                        }
                    }



                    // Não encontrando erros ...
                    if (isOk) {
                        var ft = _bt.GetFieldType(f);


                        if (ft.IsField || ft.IsTextArea || ft.IsSelect) {
                            if (cType.AllowSet === false) { f.setAttribute('disabled', 'disabled'); }
                            if (cType.AllowNull === false && !f.hasAttribute('required')) { f.setAttribute('required', 'required'); }

                            // Sets para Campos Comuns ou TextArea
                            if (!ft.IsSelect) {
                                if (cType.Length != null) { f.setAttribute('maxlength', cType.Length); }
                                if (cType.Min != null) { f.setAttribute('min', cType.Min); }
                                if (cType.Max != null) { f.setAttribute('max', cType.Max); }

                                // Se o campo permite insert E está marcado como ReadOnly
                                // verifica se o valor atual está definido...
                                if (cType.AllowSet === true && cType.ReadOnly === true && _bt.IsNotNullValue(f.value)) {
                                    f.setAttribute('readonly', 'readonly');
                                }
                            }



                            // Seta o valor padrão caso nenhum seja informado
                            if (cType.Default != null && f.value == '') {
                                if (cType.Type.Name === 'Date' && cType.Default === 'new') {
                                    var val = new Date();
                                    var use = (String.Pattern != undefined) ? String.Pattern.World.Dates.DateTime : null;
                                    use = (cType.FormatSet != null && cType.FormatSet.Format != null) ? cType.FormatSet : use;

                                    if (_bt.IsNotNullValue(use)) {
                                        f.value = use.Format(val);
                                    }
                                }
                                else {
                                    f.value = cType.Default;
                                }
                            }


                            // Adiciona verificador/formatador
                            var fc = CodeCraft.Forms;
                            if (ft.IsField || ft.IsTextArea) {
                                f.removeEventListener('keyup', fc.CheckAndFormatField, false);
                                f.addEventListener('keyup', fc.CheckAndFormatField, false);
                            }
                            else {
                                f.removeEventListener('change', fc.CheckAndFormatField, false);
                                f.addEventListener('change', fc.CheckAndFormatField, false);
                            }
                            fc.CheckAndFormatField({ target: f, check: false });
                        }
                    }

                }
            }
        },





        /**
        * A partir do "ComplexType" definido para o campo, verifica se seu valor é válido.
        * No caso do valor encontrado ser válido e haver uma formatação prevista, esta será aplicada.
        * 
        * @function CheckAndFormatField
        *
        * @memberof Forms
        *
        * @param {Node}                     o                               Elemento que será validado.
        * @param {Boolean}                  [r = true]                      Quando "true" irá retornar um valor booleano, senão, 
        *                                                                   retornará o código do erro em caso de falha ou True em caso de sucesso.
        *
        * @return {Boolean|[True|ValidateError]}
        */
        CheckAndFormatField: function (o, r) {
            var c = (o.check !== undefined) ? o.check : true;
            var r = (r === undefined) ? true : r;
            var o = o.target;
            var validate = (o.hasAttribute('data-validate')) ? _bt.TryParse.ToBoolean(!o.getAttribute('data-validate')) : true;
            var isValid = false;


            // Se o campo não deve ser validado, ou, se não possui marcação que 
            // possibilite enquadra-lo em alguma regra de validação... ignora-o
            if (!validate || !o.hasAttribute('data-complextype')) {
                isValid = true;
            }
            else {
                var dbfn = o.getAttribute('data-complextype');
                var cType = null;


                // Nome da Tabela e Coluna que o campo deve representar
                var fn = dbfn.split('.');

                if (fn.length != 2) {
                    isValid = (r === true) ? false : ValidateError.InvalidComplexType;
                }
                else {
                    cType = _selectComplexType(fn[0], fn[1]);

                    if (cType == null) {
                        isValid = (r === true) ? false : ValidateError.ComplexTypeDoesNotExist;
                    }
                    else {
                        var ft = _bt.GetFieldType(o);
                        var val = o.value;
                        var req = (_bt.IsNotNullValue(o.required)) ? _bt.TryParse.ToBoolean(o.required) : false;


                        // Verifica valores obrigatórios
                        if (req && o.value == '') {
                            var err = (ft.IsSelect) ? ValidateError.ValueNotSelected : ValidateError.RequiredValueNotSet;
                            isValid = (r === true) ? false : err;
                        }
                        else {

                            // Campos select não passam pelas validações a seguir.
                            if (ft.IsSelect) {
                                isValid = true;
                            }
                            else {
                                var ss = (_bt.IsNotNullValue(cType.FormatSet)) ? cType.FormatSet : null;

                                // Verifica se a string é válida dentro das especificações do SuperType
                                isValid = (ss != null && _bt.IsNotNullValue(ss.Check)) ? ss.Check(val) : true;

                                if (!isValid) {
                                    isValid = (r === true) ? false : ValidateError.InvalidValue;
                                }
                                else {
                                    // Força para que o valor retorne ao seu tipo original
                                    val = (ss != null && ss.RemoveFormat != null) ? ss.RemoveFormat(val) : val;
                                    val = cType.Type.TryParse(val, cType.RefType);


                                    // Valida o valor conforme o tipo de dado da coluna,
                                    // ENUNs são testados aqui
                                    isValid = cType.Type.Validate(val, cType.RefType);

                                    if (!isValid) {
                                        isValid = (r === true) ? false : ValidateError.InvalidType;
                                    }
                                    else {
                                        switch (cType.Type.Name) {
                                            // Verificação para String                                       
                                            case 'String':
                                                // Havendo um formatador, executa-o
                                                val = (ss != null && ss.Format != null) ? ss.Format(val) : val;


                                                // Verifica tamanho.
                                                if (cType.Length != null && val.length > cType.Length) {
                                                    isValid = (r === true) ? false : ValidateError.MaxLengthExceeded;
                                                }

                                                break;

                                            // Verificação para Numerais e Date                                      
                                            case 'Date':
                                            case 'Byte':
                                            case 'Short':
                                            case 'Integer':
                                            case 'Long':
                                            case 'Float':
                                            case 'Double':
                                                if (val < cType.Min || val > cType.Max) {
                                                    isValid = (r === true) ? false : ValidateError.ValueOutOfRange;
                                                }

                                                break;
                                        }



                                        if (isValid && ss != null && ss.Format != null) {
                                            o.value = ss.Format(val);
                                        }
                                    }
                                }
                            }
                        }


                        if (c) {
                            o.setAttribute('data-valid', ((isValid === true) ? true : false));
                            isValid = true;
                        }
                    }
                }
            }


            return isValid;
        },





        /**
        * Valida todos os campos encontrados para o formulário alvo.
        * Retorna True caso todos passem ou um array com objetos "ValidateFormResult" referentes
        * aos campos que falharam na validação.
        * 
        * @function CheckFields
        *
        * @memberof Forms
        *
        * @param {Node}                     f                               Elemento "form" que terá seus campos validados.
        * @param {JSON}                     [labels]                        Mensagens amigáveis para serem mostradas ao usuário.
        *                                                                   Se não forem definidas usará o objeto "ValidateErrorLabels"
        *
        * @return {True|ValidateFormResult[]}
        */
        CheckFields: function (f, labels) {
            var errors = [];
            var fc = CodeCraft.Forms;
            var tgtInputs = _dom.Get('[data-complextype]', f);
            labels = (labels === undefined) ? fc.ValidateErrorLabels : labels;


            for (var it in tgtInputs) {
                f = tgtInputs[it];
                var r = fc.CheckAndFormatField(f, false);

                if (r !== true) {

                    var msg = labels[r];
                    var lbl = (r == 'InvalidComplexType' ||
                                r == 'ComplexTypeDoesNotExist') ? f.getAttribute('data-complextype') : _getFieldName(f);

                    errors.push({
                        Field: f,
                        ErrorType: r,
                        Message: labels[r].replace('{label}', lbl)
                    });
                }
            }


            return (errors.length === 0) ? true : errors;
        }
    };


    return public;
});