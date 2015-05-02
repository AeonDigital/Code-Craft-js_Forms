/**
* @package Code Craft
* @pdesc Conjunto de soluções front-end.
*
* @module Forms
* @file Forms.
*
* @requires BasicTools
* @requires BasicDOM
* @requires ComplexType
* @requires StringExtension [optional]
*
* @author Rianna Cantarelli <rianna.aeon@gmail.com>
*/
'use strict';




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
    data-ccw-fcon-object           :        Este atributo tem como objetivo indicar qual objeto "ComplexType" controla
    a validação e formatação do campo alem de informar.
    Também informa qual "Id" dos respectivos objetos está sendo apresentado.
    Ex : 
    Suponha as seguintes tabelas e propriedades

    Tabelas : 
    Client = {
    Id : null,
    Name : 'String',
    Phone : 'Telephone[]'
    };
    Telephone = {
    Id : null,
    Number : 'String'
    };

    Um campo com o atributo [data-ccw-fcon-object="Client[N0].Name"]
    irá fazer uma conexão com a propriedade "Name" da tabela "Client".
    A indicação [Nx] define que o objeto é novo.

    Fosse usado o atributo [data-ccw-fcon-object="Client[25].Name"]
    indica que o campo deve mostrar o valor atual da propriedade "Name" da tabela "Client"
    para o respectivo registro de Id 25.

    Já um valor como [data-ccw-fcon-object="Client[15].Phone[3].Number"]
    deverá demonstrar o valor do campo "Number" da tabela "Telephone" para o registro de
    Id 3. A notação indica também que o objeto "Telephone" está contido como um dos
    elementos da propriedade "Phone" da tabela "Client" do registro de id 15.


    data-ccw-fcon-valid            :        Indica se o campo é válido [true] ou não [false]
    data-ccw-fcon-validate         :        Indica se é para validar o campo ou não [true|false]


    <form action="index.html" method="post" novalidate="novalidate">
    <div>
    <label  for="ViewForm[N0].FullName">Nome</label>
    <input  type="text"
    title="Nome"
    data-ccw-fcon-object="ViewForm[N0].FullName" />
    </div>

    <div>
    <label  for="ViewForm[N0].Email">Email</label>
    <input  type="text" 
    title="Email"
    data-ccw-fcon-object="ViewForm[N0].Email" />
    </div>

    <div>
    <label  for="ViewForm[N0].Mensagem">Mensagem</label>
    <input  type="text" 
    title="Mensagem"
    data-ccw-fcon-object="ViewForm[N0].Mensagem" />
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
    * @type {Object[Key/ComplexType[]))}
    */
    var _complexTypes = {};





    /**
    * Atalho para "CodeCraft.Widget.Factory".
    *
    * @type {Object}
    */
    var _factory = null;





    /**
    * Indica quando os objetos factories estão devidamente iniciados
    * abrindo permissão para alguns eventos internos.
    *
    * @type {Boolean}
    */
    var _hasInityFactory = false;






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
        * Valor do atributo "data-ccw-fcon-object" é inválido. 
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





















    /*
    * MÉTODOS PRIVADOS
    */



    /**
    * Conjunto de métodos para trabalhar com a notação usada para o atributo "data-ccw-fcon-object"
    */
    var _nttTools = {
        /**
        * Trata a menor porção de uma notação, retornando um objeto do tipo
        * { New : Boolean, Id : Integer, Name : 'String' }
        *
        * @function _unMake
        *
        * @param {String}                       ntt                         Notação.
        *
        * @return {Object}
        */
        _unMake: function (ntt) {
            var r = {
                New: true,
                Id: 0,
                Name: ntt
            };


            ntt = ntt.split('[');
            if (ntt.length == 2) {
                r.New = (ntt[1].indexOf('N') !== -1) ? true : false;
                r.Id = parseInt(ntt[1].replace(']', '').replace('N', ''), 10);
                r.Name = ntt[0];
            }

            return r;
        },
        /**
        * Retorna o objeto "ComplexType" a partir do valor de um atributo "data-ccw-fcon-object".
        *
        * @function _getComplexTypeByNotation
        *
        * @param {String}                       ntt                         Notação usada para a conexão do campo ao atributo alvo.
        *
        * @return {?ComplexType}
        */
        _getComplexTypeByNotation: function (ntt) {
            var r = null;
            var _nt = _nttTools;

            // Apenas se houverem, ao menos 2 partes identificadas...
            ntt = ntt.split('.');
            if (ntt.length >= 2) {
                var c = _nt._unMake(ntt[0]).Name;
                var n = _nt._unMake(ntt[1]).Name;
                r = _nt._getComplexType(c, n);


                // Havendo mais que 2 partes...
                if (ntt.length > 2) {
                    for (var i = 2; i < ntt.length; i++) {
                        c = r.RefType;
                        n = _nt._unMake(ntt[i]).Name;
                        r = _nt._getComplexType(c, n);
                    }
                }
            }

            return r;
        },
        /**
        * Retorna o objeto "ComplexType" indicado.
        *
        * @function _getComplexType
        *
        * @param {String}                       collection                  Nome da coleção.
        * @param {String}                       ctName                      Nome do tipo que será selecionado.
        *
        * @return {?ComplexType}
        */
        _getComplexType: function (collection, ctName) {
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
        },
        /**
        * Verifica se há um valor para o campo indicado no objeto "autoFillForm".
        *
        * @function _getValueFromAutoFill
        *
        * @param {Node}                         field                       Campo que se deseja retornar o valor.
        * @param {String}                       ntt                         Notação usada para identificar o campo/valor a ser resgatado.
        * @param {ComplexType}                  cType                       Objeto ComplexType do campo que será setado.
        *
        * @return {?String}
        */
        _getValueFromAutoFill: function (field, cType) {
            var rVal = null;

            if (CodeCraft.Forms.AutoFillData != null) {
                var afd = CodeCraft.Forms.AutoFillData;
                var fcon = field.getAttribute('data-ccw-fcon-object');
                var formName = null;



                // Identifica o Id do formulário que contem o campo indicado
                var parent = field.parentNode;
                while (formName == null && parent != document.body) {
                    if (parent.tagName.toLowerCase() == 'form') {
                        formName = parent.getAttribute('id');
                    }
                    else {
                        parent = parent.parentNode;
                    }
                }



                // Seleciona o objeto que é representado no formulário de Id identificado
                var focus = afd[formName];
                if (focus != undefined) {
                    var ntt = fcon.split('.');
                    var data = _nttTools._unMake(ntt[0]);
                    var prop = ntt[ntt.length - 1];


                    var stop = false;

                    // Seleciona o objeto principal
                    var focus = focus[data.Name];
                    if (focus != undefined && focus['Id'] == data.Id) {


                        // Segue objeto à objeto até atinjir o pai direto da propriedade
                        // que se deseja retornar
                        for (var i = 1; i < ntt.length - 1; i++) {
                            if (!stop) {
                                data = _nttTools._unMake(ntt[i]);
                                focus = focus[data.Name];


                                if (focus == undefined) { stop = true; }
                                else {
                                    var match = false;

                                    // Se o novo foco for um JSON...
                                    if (_bt.IsJSON(focus)) {
                                        if (focus['Id'] == data.Id) { match = true; }
                                    }
                                    // Se for um array de objetos
                                    else if (_bt.IsArray(focus)) {

                                        for (var ii in focus) {
                                            if (focus[ii]['Id'] == data.Id) {
                                                focus = focus[ii];
                                                match = true;
                                                break;
                                            }
                                        }
                                    }
                                    else { match = true; }


                                    // Não encontrando o objeto requerido...
                                    if (!match) {
                                        focus = undefined;
                                        stop = true;
                                    }
                                }
                            }
                        }


                        if (focus != undefined) {
                            rVal = focus[prop];


                            // Altera valor conforme formado de data
                            if (cType.Type.Name === 'Date') {
                                rVal = new Date(rVal);
                                var use = (String.Pattern != undefined) ? String.Pattern.World.Dates.DateTime : null;
                                use = (cType.FormatSet != null && cType.FormatSet.Format != null) ? cType.FormatSet : use;

                                if (_bt.IsNotNullValue(use)) {
                                    rVal = use.Format(rVal);
                                }
                            }
                        }


                    }
                }


            }

            return rVal;
        }
    };









    /**
    * Objeto que permite o uso integrado de CodeCraft.Form com o CodeCraft.Widget.Factory.
    */
    var _factoryTools = {
        /**
        * Identifica o node passado é filho de algum modelo de alguma fábrica.
        *
        * @private
        *
        * @paran {Node}                 n                       Elemento que se deseja testar.
        *
        * @return {Boolean}
        */
        IsChildOfModel: function (n) {
            return (_factory !== null && _factory.IsChildOfModel(n));
        },
        /**
        * Altera os atributos do elemento alvo, removendo a marcação [M] pelo Indice indicado.
        *
        * @param {Node}                         e                               Node do elemento.
        * @param {String[]}                     attrs                           Array com Nome dos atributos a serem alterados.
        * @param {Integer}                      id                              Indice a ser utilizado.
        */
        ChangeAttrs: function (e, attrs, id) {
            for (var it in attrs) {
                var a = attrs[it];

                if (e.hasAttribute(a)) {
                    e.setAttribute(a, e.getAttribute(a).replace('[M]', id));
                }
            }
        },




        /**
        * Eventos para os objetos de fábricas de formulários
        */
        FactoryEvents: {
            /**
            * Imediatamente após adicionar uma nova Instância no DOM, efetua estes sets.
            *
            * @function onAddInstance
            *
            * @param {FactoryObject}            f                       Objeto que representa a fábrica relacionada ao evento disparado.
            * @param {Node}                     inst                    Node da instância que foi alterada durante este evento.
            */
            onAddInstance: function (f, inst) {
                // Resgata todos os elementos de formulário dentro da nova Instância
                var tgtElem = _dom.Get('input, textarea, select, label, button, datalist', inst);
                var tgtAttrs = ['for', 'id', 'name', 'data-ccw-fcon-object'];
                var id = parseInt(inst.getAttribute('data-ccw-factory-item-id'), 10);


                for (var it in tgtElem) {
                    _factoryTools.ChangeAttrs(tgtElem[it], tgtAttrs, id);
                }


                if (_hasInityFactory) {
                    _public.ConnectFields(inst);
                }
            }
        }
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
    var _public = this.Control = {
        /**
        * Objeto que armazena os dados que serão automaticamente preenchidos nos campos
        * conectados de um formulário
        *
        * @type {JSON}
        */
        AutoFillData: null,





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
            * Valor do atributo "data-ccw-fcon-object" é inválido. 
            *
            * @memberof ValidateErrorLabels
            */
            InvalidComplexType: 'The value "{label}" of attribute "data-ccw-fcon-object" is invalid.',
            /**
            * ComplexType definido não existe.
            *
            * @memberof ValidateErrorLabels
            */
            ComplexTypeDoesNotExist: 'Table or column does not exist.\n[data-ccw-fcon-object="{label}"]',
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
        * @return {?ComplexType}
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
        * Inicia todas as definições especiais para os formulários de uma view.
        * 
        * @function StartForms
        *
        * @memberof Forms
        */
        StartForms: function () {
            _public.CheckFactoryInstances();


            // Conecta os campos marcados
            _public.ConnectFields();
        },




        /**
        * Conecta os campos marcados com seus respectivos objetos "ComplexType".
        * 
        * @function ConnectFields
        *
        * @memberof Forms
        *
        * @param {Node}                 [node]              Node dentro do qual os campos serão conectados.
        */
        ConnectFields: function (node) {
            var tgtInputs = _dom.Get('input, textarea, select', node);
            var d = true;


            for (var it in tgtInputs) {
                var f = tgtInputs[it];


                // apenas se for um objeto válido E que não seja parte de um modelo definido...
                if (f.hasAttribute('data-ccw-fcon-object') && !_factoryTools.IsChildOfModel(f)) {
                    var fcon = f.getAttribute('data-ccw-fcon-object');
                    var cType = _nttTools._getComplexTypeByNotation(fcon);


                    if (cType == null) {
                        console.log('Input has an invalid value for attribute "data-ccw-fcon-object". Found "' + fcon + '".');
                    }
                    else {
                        var ft = _bt.GetFieldType(f);


                        if (!ft.IsRadio) {
                            f.setAttribute('id', fcon);
                        }
                        f.setAttribute('name', fcon);


                        // Preenche os campos SELECT caso o tipo seja um enumerador
                        if (ft.IsSelect && cType.Type.Name == 'Enum') {
                            while (f.hasChildNodes()) {
                                f.removeChild(f.firstChild);
                            }

                            for (var ii in cType.RefType) {
                                var opt = document.createElement('option');
                                opt.setAttribute('value', ii);
                                opt.textContent = cType.RefType[ii];

                                f.appendChild(opt);
                            }
                        }




                        // Se houver um valor previamente definido para o campo... 
                        var fill = _nttTools._getValueFromAutoFill(f, cType);
                        if (fill != null) {
                            if (ft.IsRadio) {
                                f.checked = (f.value == fill);
                            }
                            else if (ft.IsCheckBox) {
                                f.checked = fill;
                            }
                            else {
                                f.value = fill;
                            }
                        }




                        // Marca todos os checkbox como não validáveis
                        if (ft.IsCheckBox) {
                            f.setAttribute('data-ccw-fcon-validate', 'false');
                        }
                        else if (ft.IsField || ft.IsTextArea || ft.IsSelect) {
                            if (cType.AllowSet === false) { f.setAttribute('disabled', 'disabled'); }
                            if (cType.AllowNull === false && !f.hasAttribute('required')) { f.setAttribute('required', 'required'); }

                            // Sets para Campos Comuns ou TextArea
                            if (!ft.IsSelect) {
                                if (cType.Length != null) { f.setAttribute('maxlength', cType.Length); }
                                if (cType.Min != null) {
                                    var vM = (cType.Type.Name != 'Date') ? cType.Min : cType.Type.ParseToString(cType.Min);
                                    f.setAttribute('min', vM);
                                }
                                if (cType.Max != null) {
                                    var vM = (cType.Type.Name != 'Date') ? cType.Max : cType.Type.ParseToString(cType.Max);
                                    f.setAttribute('max', vM);
                                }

                                // Se o campo permite insert E está marcado como ReadOnly
                                // verifica se o valor atual está definido...
                                if (cType.AllowSet === true && cType.ReadOnly === true && _bt.IsNotNullValue(f.value)) {
                                    f.setAttribute('readonly', 'readonly');
                                }
                            }




                            // Seta o valor padrão caso nenhum seja informado
                            if (cType.Default != null && f.value == '') {

                                if (cType.Type.Name === 'Date' && cType.Default.toLowerCase() === 'now()') {
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
                            var ev = (ft.IsField || ft.IsTextArea) ? 'keyup' : 'change';

                            _dom.SetEvent(f, ev, fc.CheckAndFormatField);
                            fc.CheckAndFormatField(f, false);
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
        * @param {Boolean}                  [c = true]                      Indica se é ou não para usar o atributo [data-ccw-fcon-valid] no elemento.
        * @param {Boolean}                  [r = true]                      Quando "true" irá retornar um valor booleano, senão, 
        *                                                                   retornará o código do erro em caso de falha ou True em caso de sucesso.
        *
        * @return {Boolean|[True|ValidateError]}
        */
        CheckAndFormatField: function (o, c, r) {
            o = (o.target === undefined) ? o : o.target;
            c = (c === undefined) ? true : c;
            r = (r === undefined) ? true : r;

            var validate = (o.hasAttribute('data-ccw-fcon-validate')) ? _bt.TryParse.ToBoolean(!o.getAttribute('data-ccw-fcon-validate')) : true;
            var isValid = false;


            // Se o campo não deve ser validado, ou, se não possui marcação que 
            // possibilite enquadra-lo em alguma regra de validação... ignora-o
            if (!validate || !o.hasAttribute('data-ccw-fcon-object')) {
                isValid = true;
            }
            else {
                var cType = _nttTools._getComplexTypeByNotation(o.getAttribute('data-ccw-fcon-object'));
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
                        o.setAttribute('data-ccw-fcon-valid', ((isValid === true) ? true : false));
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
        * @function CheckFormFields
        *
        * @memberof Forms
        *
        * @param {Node}                     form                            Elemento "form" que terá seus campos validados.
        * @param {JSON}                     [labels]                        Mensagens amigáveis para serem mostradas ao usuário.
        *                                                                   Se não forem definidas usará o objeto "ValidateErrorLabels"
        *
        * @return {True|ValidateFormResult[]}
        */
        CheckFormFields: function (form, labels) {
            var errors = [];
            var fc = CodeCraft.Forms;
            var tgtInputs = _dom.Get('[data-ccw-fcon-object]', form);
            labels = (labels === undefined) ? fc.ValidateErrorLabels : labels;


            for (var it in tgtInputs) {
                var f = tgtInputs[it];

                // Apenas se não for um item de um modelo
                if (!_factoryTools.IsChildOfModel(f)) {
                    var r = fc.CheckAndFormatField(f, true, false);

                    if (r !== true) {

                        var msg = labels[r];
                        var lbl = (r == 'InvalidComplexType' ||
                                r == 'ComplexTypeDoesNotExist') ? f.getAttribute('data-ccw-fcon-object') : _getFieldName(f);

                        errors.push({
                            Field: f,
                            ErrorType: r,
                            Message: labels[r].replace('{label}', lbl)
                        });
                    }
                }
            }


            return (errors.length === 0) ? true : errors;
        },





        /**
        * A partir dos campos conectados do formulário alvo, remonta o/s objeto/s que devem ser enviado/s
        * para o servidor.
        *
        * 
        * @function RetrieveFormObjects
        *
        * @memberof Forms
        *
        * @param {Node}                     form                            Elemento "form" cujos campos conectados serão retornados.
        *
        * @return {?JSON}
        */
        RetrieveFormObjects: function (form) {
            var tgtInputs = _dom.Get('input, textarea, select', form);
            var returnData = {};
            var hasValue = false;
            var isOk = true;


            // Para cada campo do formulário alvo...
            for (var it in tgtInputs) {
                var f = tgtInputs[it];

                // Apenas se for um objeto válido E que não seja parte de um modelo definido...
                if (f.hasAttribute('data-ccw-fcon-object') && !_factoryTools.IsChildOfModel(f)) {
                    var cType = null;
                    var ft = _bt.GetFieldType(f);
                    var fcon = f.getAttribute('data-ccw-fcon-object');
                    var split = fcon.split('.');
                    var attr = split[split.length - 1];
                    var lastModelName = fcon.split('[')[0];
                    var parentModel = returnData;



                    // Seleciona o objeto alvo para o set do valor
                    for (var i = 0; i < split.length - 1; i++) {
                        var data = _nttTools._unMake(split[i]);
                        var newObject = { __new: data.New, Id: data.Id };
                        var n = data.Name;
                        var arrObj = null;


                        // Para o primeiro objeto...
                        if (i == 0) {
                            if (parentModel[n] === undefined) {
                                parentModel[n] = newObject;
                            }
                        }
                        // Para todos os demais níveis
                        else {
                            cType = _nttTools._getComplexType(lastModelName, n);
                            lastModelName = cType.RefType;


                            // Se o objeto deste nível não foi setado... seta-o
                            if (parentModel[n] === undefined) {
                                parentModel[n] = (cType.Type.Name == 'Object[]') ? [newObject] : newObject;
                            }

                            // Se for uma coleção de um tipo de objetos, verifica se o objeto
                            // com o Id escolhido já foi setado...
                            if (cType.Type.Name == 'Object[]') {
                                for (var ii in parentModel[n]) {
                                    if (parentModel[n][ii].Id == data.Id) {
                                        arrObj = parentModel[n][ii];
                                        break;
                                    }
                                }

                                // Se nenhum objeto possui o Id indicado, é um novo objeto
                                if (arrObj == null) {
                                    parentModel[n].push(newObject);
                                    arrObj = parentModel[n][parentModel[n].length - 1];
                                }
                            }

                        }

                        // Seleciona o novo objeto para ter seu valor setado
                        parentModel = (arrObj == null) ? parentModel[n] : arrObj;
                    }





                    if (ft.IsRadio) {
                        // SE o valor para esta propriedade ainda não foi setada...
                        if (parentModel[attr] === undefined) {
                            var rName = f.getAttribute('name');
                            var rVal = null;
                            var allRadios = _dom.Get('input[name="' + rName + '"]');

                            for (var ii in allRadios) {
                                if (allRadios[ii].checked) { rVal = allRadios[ii].value; break; }
                            }

                            parentModel[attr] = rVal;
                            hasValue = true;
                        }
                    }
                    else {
                        // Efetua sets finais para o valor encontrado...
                        var cType = _nttTools._getComplexType(lastModelName, attr);
                        var val = (ft.IsCheckBox) ? _bt.TryParse.ToBoolean(f.checked) : f.value;


                        // Verifica se a string é válida dentro das especificações do SuperType
                        var ss = (_bt.IsNotNullValue(cType.FormatSet)) ? cType.FormatSet : null;
                        val = (ss != null && ss.RemoveFormat != null) ? ss.RemoveFormat(val) : val;
                        val = cType.Type.TryParse(val, cType.RefType);


                        // Se o valor setado for Vazio e este campo não permite este tipo de valor... 
                        // Ou se é um campo que não é permitido a definição de seu valor externamente...
                        if ((!_bt.IsNotNullValue(val) && !cType.AllowEmpty) || !cType.AllowSet) {
                            val = null;
                        }


                        parentModel[attr] = val;
                        hasValue = true;
                    }


                }
            }





            /**
            * Trata o objeto que será retornado removendo propriedades de marcação.
            *
            * @param {JSON}             json            Objeto que será tratado.
            *
            * @return {JSON}
            */
            var __rewriteData = function (json) {

                // Se o objeto é novo, remove o atributo "Id"
                if (json['__new']) {
                    delete json['Id'];
                }


                // Remove o atributo de marcação "__new"
                delete json['__new'];


                // Para cada propriedade do objeto...
                for (var it in json) {
                    var obj = json[it];


                    if (_bt.IsArray(obj)) {
                        for (var ii in obj) {
                            __rewriteData(obj[ii]);
                        }
                    }
                    else if (_bt.IsJSON(obj)) {
                        __rewriteData(obj);
                    }
                }
            };





            __rewriteData(returnData);
            return (isOk && hasValue) ? returnData : null;
        },


















        /**
        * Prepara todos os campos <input> do formulário alvo para dispararem o evento indicado
        * ao pressionar o botão "Enter".
        * 
        * @function SetActionOnEnter
        *
        * @memberof Forms
        *
        * @param {Node}                     f                               Elemento "form" alvo.
        * @param {Function}                 ev                              Evento que será disparado.
        */
        SetActionOnEnter: function (f, ev) {
            // Evento que será adicionado nos campos encontrados
            var __event_OnEnter = function (e) { if (e.keyCode == 13) { ev(e); } };


            var flds = _dom.Get('input', f);
            for (var it in flds) {
                var t = flds[it].type;

                switch (t) {
                    case 'datetime-local': case 'datetime': case 'date':
                    case 'month': case 'week': case 'time': case 'number':
                    case 'range': case 'email': case 'color': case 'tel':
                    case 'url': case 'text': case 'password': case 'search':

                        _dom.SetEvent(flds[it], 'keyup', __event_OnEnter);
                        break;
                }
            }
        },





        /**
        * Se o objeto "CodeCraft.Widget.Factory" estiver presente, adiciona em sua 
        * lista de eventos os eventos as configurações definidas em "_factoryTools.FactoryEvents"
        * Isto permite conectar os campos internos dos objetos gerados pela "factory".
        * No node da factory alvo, use o atributo [data-ccw-factory-events="CodeCraftFactoryEvents"]
        * 
        * @function ConnectEventsForWidgetFactory
        *
        * @memberof Forms
        */
        ConnectEventsForWidgetFactory: function () {
            // Efetua integração com "CodeCraft.Widget.Factory" 
            if (typeof (CodeCraft.Widget) !== 'undefined' && typeof (CodeCraft.Widget.Factory) !== 'undefined') {
                _factory = CodeCraft.Widget.Factory;

                // Associa os eventos para as fábricas de formulários
                _factory.FactoryEvents['CodeCraftFactoryEvents'] = _factoryTools.FactoryEvents;
            }
        },





        /**
        * Verifica compatibilidade entre o objeto de dados e o número 
        * de instâncias das factories relacionadas
        * 
        * @function CheckFactoryInstances
        *
        * @memberof Forms
        */
        CheckFactoryInstances: function () {
            // Apenas se há set de dados
            if (CodeCraft.Forms.AutoFillData != null) {
                var afd = CodeCraft.Forms.AutoFillData;



                /**
                * Verifica a consistência entre o número de instâncias no DOM
                * e o número de objetos que devem ser representados.
                *
                * @param {String}           form                Id do formulário que está sendo conferido.
                * @param {Object}           odata               Objeto que está sendo verificado.
                * @param {String}           iname               Nome base da instância.
                * @param {Integer}          fnumber             Número identificador da fábrica.
                */
                var __checkInstancesOfFactory = function (form, odata, iname, fnumber) {


                    // Resgata todas as factories do formulário alvo
                    var facts = _dom.Get('#' + form + ' [data-ccw-factory]');
                    if (facts == null) { facts = []; }
                    else {
                        var nf = [];

                        // Mantem apenas as factories que não são filhos de models
                        for (var it in facts) {
                            if (!CodeCraft.Widget.Factory.IsChildOfModel(facts[it])) {
                                nf.push(facts[it]);
                            }
                        }

                        facts = nf;
                    }




                    // Apenas se houverem factories no formulário alvo...
                    if (facts.length > 0) {
                        var checkAfter = [];
                        var checkAfterName = [];
                        var checkAfterNumber = [];

                        var checkArray = [];
                        var checkArrayName = [];



                        // para cada propriedade do objeto atual...
                        for (var prop in odata) {
                            var value = odata[prop];
                            var childName = iname + '_' + prop;


                            // Sendo um JSON, seleciona-o para ser verificado apos a verificação dos array
                            if (_bt.IsJSON(value)) {
                                checkAfter.push(value);
                                checkAfterName.push(childName);
                                checkAfterNumber.push(fnumber);
                            }
                            else if (_bt.IsArray(value) && value.length > 0) {
                                checkArray.push(value);
                                checkArrayName.push(childName);
                            }
                        }



                        // Efetua a verificação dos objetos que são Arrays, ou seja,
                        // provavelmente são representados por fábricas no DOM
                        for (var it in checkArray) {
                            var oArr = checkArray[it];
                            var childName = checkArrayName[it];


                            var tgtFact = null;
                            var fname = null;
                            var index = null;



                            // Tenta identificar a factory alvo 
                            for (var it in facts) {
                                var fac = facts[it];

                                fname = fac.getAttribute('data-ccw-factory');


                                // SE for a factory que se está procurando...
                                if (fname == childName + '_' + fnumber) {
                                    tgtFact = fac;
                                    break;
                                }
                            }



                            // Encontrando a factory responsável por representar o 
                            // tipo de objeto que o array armazena...
                            if (tgtFact != null) {

                                // Verifica se cada objeto possui uma instância correspondente
                                for (var ii in oArr) {
                                    var inst = _dom.Get('#' + form + ' [data-ccw-factory="' + fname + '"] > [data-ccw-factory-item][data-ccw-factory-item-index="' + ii + '"]');

                                    if (inst == null) {
                                        var btn = _dom.Get('[data-ccw-factory-btn-add="' + fname + '"]')[0];
                                        CodeCraft.Widget.Factory.ControlInstance(btn);
                                    }
                                }
                            }



                            // Adiciona os objetos do array na lista de verificação posterior
                            for (var ii in oArr) {
                                checkAfter.push(oArr[ii]);
                                checkAfterName.push(childName);
                                checkAfterNumber.push(parseInt(ii, 10) + 1);
                            }
                        }




                        // Verifica os objetos que não são array e estão no mesmo nível das demais propriedades
                        for (var it in checkAfter) {
                            __checkInstancesOfFactory(form, checkAfter[it], checkAfterName[it], checkAfterNumber[it]);
                        }
                    }
                };



                /**
                * Seta corretamente os campos do formulário corrigindo suas marcações de Id.
                *
                * @param {Object}           odata               Objeto que está sendo verificado.
                * @param {Integer}          fnumber             Número identificador da fábrica.
                * @param {String}           baseId              Nome base do Id dos campos que serão alterados.
                * @param {String}           newId               Nome base da instância.
                */
                var __resetIDFields = function (odata, fnumber, baseId, newId) {

                    var oldFieldId = baseId + '[N' + fnumber + '].';
                    var newFieldId = newId + '[' + odata['Id'] + '].';

                    for (var prop in odata) {
                        var value = odata[prop];
                        var getFieldId = oldFieldId + prop;
                        var setFieldId = newFieldId + prop;


                        if (_bt.IsJSON(value)) {
                            __resetIDFields(value, fnumber, getFieldId, setFieldId);
                        }
                        else if (_bt.IsArray(value) && value.length > 0) {
                            for (var it in value) {
                                __resetIDFields(value[it], parseInt(it) + 1, getFieldId, setFieldId);
                            }
                        }
                        else {
                            var fld = _dom.Get('[data-ccw-fcon-object="' + getFieldId + '"]');
                            if (fld != null) {
                                fld[0].setAttribute('data-ccw-fcon-object', setFieldId);


                                var ft = _bt.GetFieldType(fld[0]);
                                if (!ft.IsRadio) {
                                    fld[0].setAttribute('id', setFieldId);
                                }
                                fld[0].setAttribute('name', setFieldId);


                                var lbl = _dom.Get('label[for="' + getFieldId + '"]');
                                if (lbl != null) {
                                    lbl[0].setAttribute('for', setFieldId);
                                }
                            }
                        }
                    }

                };





                // para cada formulário que está configurado com um objeto de dados...
                for (var fid in afd) {

                    // Se o formulário for encontrado no DOM...
                    var form = _dom.Get('#' + fid);
                    if (form != null) {
                        var focus = afd[fid];
                        var iname = Object.keys(focus)[0];


                        __checkInstancesOfFactory(fid, focus[iname], iname, 1);
                        __resetIDFields(focus[iname], 1, iname, iname);
                    }
                }


                _hasInityFactory = true;
            }

        }
    };






    return _public;
});