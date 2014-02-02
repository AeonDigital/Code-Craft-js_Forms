/**
* @package Code Craft
* @pdesc Conjunto de soluções front-end.
*
* @module Forms
* @file Objeto para manipulação de elementos de formulários.
*
* @requires Get
* @requires StringExtension
* @requires WeekDate [opcional]
* @requires HashTable [opcional]
* @requires Label
*
* @author Rianna Cantarelli <rianna.aeon@gmail.com>
*/









// Caso o Objeto Interface ainda não exista... cria-o
if (typeof (Interface) === 'undefined') { var Interface = {}; }








/**
* Objeto para manipulação de elementos de formulários.
*
* @class Forms
*
* @global
*
* @static
*
* @type {Class}
*/
var Forms = new (function () {

    var static = {



        /**
        * Classe que representa um elemento de formulário
        * 
        * @class Forms.FieldElement
        *
        * @memberof Forms
        *
        * @type {Class}
        *
        * @property {Node}                          self                                Elemento HTML do formulário.
        * @property {?String}                       accept = null                       Propriedade "acept";
        * @property {Boolean}                       autocomplete = false                Propriedade "autocomplete";
        * @property {Boolean}                       autofocus = false                   Propriedade "autofocus";
        * @property {Boolean}                       checked = false                     Propriedade "checked";
        * @property {String[]}                      class = "[]"                        Propriedade "class";
        * @property {Integer}                       decimal = 0                         Atributo especial "data-decimal"; Indica o tamanho em caracteres para a representação da parte decimal de um número.
        * @property {?String}                       def = null                          Atributo especial "data-def"; Indica o objeto "DataDefinition" com o qual o valor será validado e formatado.
        * @property {Boolean}                       disabled = false                    Propriedade "disabled";
        * @property {Boolean}                       format = true                       Atributo especial "data-format"; Indica quando o valor do campo deve ser formatado após a validação.
        * @property {Boolean}                       get = true                          Atributo especial "data-get"; Quando "true" fará uso do campo para o envio dos dados. Caso contrário o ignorará.
        * @property {?String}                       id = null                           Propriedade "id";
        * @property {?Number}                       max = null                          Propriedade "max";
        * @property {?integer}                      maxLength = null                    Propriedade "maxlength";
        * @property {?Number}                       min = null                          Propriedade "min";
        * @property {Boolean}                       multiple = false                    Propriedade "multiple";
        * @property {?String}                       name = null                         Propriedade "name";
        * @property {?String}                       pattern = null                      Propriedade "pattern";
        * @property {?String}                       placeholder = null                  Propriedade "placeholder";
        * @property {?String}                       radiovalue = null                   Valor selecionado em um grupo de radiobuttons;
        * @property {Boolean}                       readonly = false                    Propriedade "readonly";
        * @property {Boolean}                       required = false                    Propriedade "required";
        * @property {?Number}                       step = null                         Propriedade "step";
        * @property {String}                        tagName                             Nome da tag do elemento.
        * @property {?String}                       type = null                         Propriedade "type";
        * @property {?String}                       title = null                        Propriedade "title";
        * @property {Boolean}                       valid = true                        Atributo especial "data-valid"; Indica se o campo possui um valor válido baseado em suas configurações.
        * @property {Boolean}                       validate = true                     Atributo especial "data-validate"; Indica se o campo deve ou não ser validado.
        * @property {String}                        value = ""                          Propriedade "value";
        */


        /**
        * Gera uma instância "FieldElement".
        * 
        * @constructs
        *
        * @memberof Forms.FieldElement
        *
        * @param {String|Object}                    o                                   Seletor CSS ou elemento de formulário.
        */
        FieldElement: function (o) {
            var fl = o;
            if (typeof (o) === 'string') { fl = Get(o); }


            var o = {
                self: fl,
                accept: GetProp(fl, 'accept', null),
                autocomplete: GetBooleanProp(fl, 'autocomplete', false),
                autofocus: GetBooleanProp(fl, 'autofocus', false),
                checked: GetBooleanProp(fl, 'checked', false),
                class: GetClass(fl),
                decimal: GetProp(fl, 'data-decimal', 0),
                def: GetProp(fl, 'data-def', null),
                disabled: GetBooleanProp(fl, 'disabled', false),
                format: GetBooleanProp(fl, 'data-format', true),
                get: GetBooleanProp(fl, 'data-get', true),
                id: GetProp(fl, 'id', null),
                max: GetProp(fl, 'max', null),
                maxLength: GetProp(fl, 'maxlength', null),
                min: GetProp(fl, 'min', null),
                multiple: GetBooleanProp(fl, 'multiple', false),
                name: GetProp(fl, 'name', null),
                pattern: GetProp(fl, 'pattern', null),
                placeholder: GetProp(fl, 'placeholder', null),
                radiovalue: null,
                readonly: GetBooleanProp(fl, 'readonly', false),
                required: GetBooleanProp(fl, 'required', false),
                step: GetProp(fl, 'step', null),
                tagName: fl.tagName.toLowerCase(),
                type: GetProp(fl, 'type', null),
                title: GetProp(fl, 'title', null),
                valid: GetBooleanProp(fl, 'data-valid', true),
                validate: GetBooleanProp(fl, 'data-validate', true),
                value: GetProp(fl, 'value', '')
            };


            // Corrige valor do campo
            if (o.value != fl.value) { o.value = fl.value; }



            // Corrige propriedades a partir das classes especiais
            for (var it in o.class) {
                var cl = o.class[it].toLowerCase();
                switch (cl) {
                    // Classes que identificam campos de Data                                                                                                                                                                                                    
                    case 'type-datetime-local':
                    case 'type-datetime':
                    case 'type-date':
                    case 'type-month':
                    case 'type-week':
                    case 'type-time':

                        // Verifica classes que identificam campos numéricos
                    case 'type-number':
                    case 'type-range':

                        // Verifica classes que identificam campos especiais
                    case 'type-email':
                    case 'type-color':
                    case 'type-tel':
                    case 'type-url':
                        o.type = cl.replace('type-', '');
                        break;
                }
            }



            // Identifica formato usado pelo campo conforme seu atributo "type".
            if (o.def != null) {
                var sp = o.def.split('.');
                o.def = String.Pattern;
                for (var it in sp) {
                    var c = (sp[it] == ':') ? 'World' : sp[it];
                    o.def = o.def[c];
                }
            }
            // Senão, se não foi definido... a definição se dá pelo "type" do campo.
            else if (o.type != null) {
                var wrp = String.Pattern.World;
                switch (o.type.toLowerCase()) {
                    case 'datetime-local':
                        o.def = wrp.Dates.DateTimeLocal;
                        break;
                    case 'datetime':
                        o.def = wrp.Dates.DateTime;
                        break;
                    case 'date':
                        o.def = wrp.Dates.Date;
                        break;
                    case 'month':
                        o.def = wrp.Dates.Month;
                        break;
                    case 'week':
                        o.def = wrp.Dates.Week;
                        break;
                    case 'time':
                        o.def = wrp.Dates.Time;
                        break;
                    case 'number':
                    case 'range':
                        o.def = wrp.Number;
                        break;
                    case 'email':
                        o.def = wrp.Email;
                        break;
                    case 'color':
                        o.def = wrp.Color;
                        break;
                    case 'url':
                        o.def = wrp.URL;
                        break;
                }
            }





            // Tipos que não são avaliados por sua natureza intrinseca.
            switch (o.type) {
                case 'button': case 'submit':
                case 'radio': case 'checkbox':
                    o.validate = false;
                    break;
            }



            // Resgata o valor setado para campos select de multipla opção.
            if (o.tagName == 'select' && o.multiple) {
                var nV = [];

                var s = Get('option[selected]', fl);
                for (var it in s) { nV.push(s[it].value.toString()); }

                o.value = nV;
            }



            // Resgata o valor setado para o grupo de radio buttom
            if (o.type == 'radio') {
                var r = Get('input[name="' + o.name + '"]');

                for (var it in r) {
                    if (o.radiovalue === null && r[it].checked) {
                        o.radiovalue = r[it].value.toString();
                    }
                }
            }



            // Resgata o titulo ou um label para o campo.
            if (o.title == null) {
                var lbl = Get('label[for="' + o.id + '"]');
                if (lbl !== null) { o.title = lbl[0].textContent; }
            }

            return o;
        },

        /**
        * Testa atributo "min" e "max" do elemento alvo.
        * 
        * @function IsValidMinOrMax
        *
        * @memberof Forms
        *
        * @param {FieldElement}                     o                                   Objeto "FieldElement" do campo que será testado.
        *
        * @return {Boolean}
        */
        IsValidMinOrMax: function (o) {
            var val = o.value;
            var min = o.min;
            var max = o.max;
            var minOK = (min == null) ? true : false;
            var maxOK = (max == null) ? true : false;

            // Conforme o tipo do input
            switch (o.type) {
                // Para inputs de data...                                                                                                                                                                                                                                                                          
                case 'datetime-local':
                case 'datetime':
                case 'date':
                case 'month':
                case 'week':
                case 'time':
                    var f = (o.def != null) ? o.def.Mask : null;
                    var iW = (o.type == 'week') ? true : false;

                    if (iW && typeof (WeekDate) === 'undefined') {
                        console.log('Namespace "WeekDate" não encontrada');
                    }
                    else {
                        var aDate = (iW) ? val.DateOfWeek() : val.ToDate(f);
                        var tDate = null;

                        if (min != null) {
                            tDate = (iW) ? min.DateOfWeek() : min.ToDate(f);
                            minOK = (aDate >= tDate) ? true : false;
                        }
                        if (max != null) {
                            tDate = (iW) ? max.DateOfWeek() : max.ToDate(f);
                            maxOK = (aDate <= tDate) ? true : false;
                        }
                    }

                    break;

                // Para inputs numéricos                                                                                                                                                                                                                                                                     
                case 'number':
                case 'range':
                    if (val.IsNumber()) {
                        var n = parseFloat(val);
                        minOK = (min == null || n >= min) ? true : false;
                        maxOK = (max == null || n <= max) ? true : false;
                    }
                    break;
            }

            return (minOK && maxOK) ? true : false;
        },

        /**
        * Efetua a validação do campo indicado.
        * 
        * @function FieldValidate
        *
        * @memberof Forms
        *
        * @param {String|FieldElement}              o                                   Seletor CSS ou objeto "FieldElement".
        *
        * @return {?Boolean}
        *
        * @example Exemplo de retornos possíveis
        * "null" caso seja um campo obrigatório que não possui valor.
        * "false" caso o valor informado seja inválido por qualquer motivo.
        * "true" caso o valor encontrado seja considerado válido.
        */
        FieldValidate: function (o) {
            if (typeof (o) === 'string' || TypeOf(o).indexOf('[object HTML') != -1) { o = Forms.FieldElement(o); }
            else {
                var t = TypeOf(o);
                if (t == '[object KeyboardEvent]' || t == '[object FocusEvent]') {
                    o = Forms.FieldElement(o.target);
                }
            }

            var iR = true;

            if (o.type != 'range') {

                var v = o.value;

                if (o.validate) {
                    if (v == '') { iR = (o.required) ? null : true; }
                    else {
                        if (o.def != null) {
                            // Testa o valor conforme o tipo
                            // Verifica valores mínimos e máximos, se forem definidos
                            iR = (o.def.Check(v)) ? Forms.IsValidMinOrMax(o) : false;
                        }
                        else if (o.pattern != null) {
                            iR = v.IsPatternMatch(o.pattern);
                        }
                    }
                }


                // Marca o campo conforme o resultado da validação
                o.valid = iR;
                o.self.setAttribute('data-valid', iR);


                // SE, há uma definição para o tipo de dado armazenado pelo campo, E,
                // há indicação de que o valor deve ser formatado, E,
                // a validação passou no teste, E, 
                // não sendo um campo "number" nem "url"
                if (o.def != null && o.format && iR && o.type != 'number' && o.type != 'url') {
                    o.self.value = o.def.Format(v);
                }
            }

            return iR;
        },










        /**
        * Objeto que contém informações de um formulário, sua validação e dados.
        *
        * @typedef FormPack
        *
        * @global
        *
        * @property {Boolean}                   Valid                               Indica se todos os campos foram válidados com sucesso.
        * @property {HashTable}                 HashData                            Objeto HashTable contendo os dados dos campos validados.
        * @property {HashTable}                 HashError                           Objeto HashTable contendo informações sobre os campos inválidos.
        */










        /**
        * Recolhe as informações dos campos do formulário alvo e retorna um objeto FormPack.
        * 
        * @function RetrieveFormPack
        *
        * @memberof Forms
        *
        * @param {String|Node|Node[]}           o                                   Seletor CSS para o node pai dos campos alvo.
        *                                                                           Objeto Node pai dos elementos alvo.
        *                                                                           O próprio conjunto de objetos alvo.
        *
        * @return {FormPack}
        */
        RetrieveFormPack: function (o) {
            var fields = null;
            var isV = true;
            var Data = new HashTable();
            var Erro = new HashTable();


            if (typeof (o) === 'string') { fields = Get(o + ' input, ' + o + ' textarea, ' + o + ' select'); }
            else if (o.constructor === Array) { fields = o; }
            else { fields = Get('input, textarea, select', o); }

            var oInfo = [];

            // Verifica campos "radio" e "checkbox" e resgata os demais
            for (var it in fields) {
                // Apenas se for um campo retornável...
                if (GetBooleanProp(fields[it], 'data-get', true)) {
                    var info = Forms.FieldElement(fields[it]);

                    if (info.type == 'radio') {
                        if (info.checked) {
                            Data.Add(info.name, info.radiovalue);
                        }
                    }
                    else if (info.type == 'checkbox') {
                        Data.Add(info.id, info.checked);
                    }
                    else {
                        oInfo.push(info);
                    }
                }
            }


            // Para cada campo que deve ser verificado
            for (var it in oInfo) {
                var info = oInfo[it];
                var valid = (info.validate) ? Forms.FieldValidate(info) : true;

                // Sendo um valor válido
                if (valid) {

                    // SE, há uma definição para o tipo de dado armazenado pelo campo, E,
                    // há indicação de que o valor deve ser formatado, E,
                    // não sendo um campo "range"
                    if (info.def != null && info.format && info.type != 'range') {
                        if (info.type == 'number') {
                            info.self.value = info.def.Format(info.self.value, undefined, info.decimal);
                        }
                        else {
                            info.self.value = info.def.Format(info.self.value);
                        }
                        info.value = info.self.value
                    }

                    Data.Add(info.id, info.value);
                }
                else {
                    var msg = Labels.FieldError;

                    // Conforme o tipo de erro seleciona a mensagem mais adequada
                    if (info.required && info.value == '') {
                        switch (info.tagName) {
                            case 'input':
                            case 'textarea':
                                msg = Labels.FieldValueEmpty;
                                break;

                            case 'select':
                                msg = Labels.FieldSelectOne;
                                break;
                        }
                    }
                    else {
                        if (info.tagName == 'input') {
                            msg = Labels.FieldInvalidValue;
                        }
                    }

                    msg = msg.replace('{label}', info.title);
                    Erro.Add(info.id, msg);
                    isV = false;
                }
            }


            return {
                Valid: isV,
                HashData: Data,
                HashError: Erro
            };
        }
    };










    /**
    * Classe que provê métodos manipuladores de interface.
    *
    * @class Interface
    *
    * @global
    *
    * @static
    *
    * @type {Class}
    */
    newInterfaceMethods = {


        /**
        * Associa o evento informado aos Inputs do formulário alvo. O evento será disparado 
        * sempre que a tecla "enter" for precionada quando o foco estiver em um dos campos Input.
        *
        * @function SetActionOnEnter
        *
        * @memberof Interface
        *
        * @param {String|Node|Node[]}           o                                   Seletor CSS para o node pai dos campos alvo.
        *                                                                           Objeto Node pai dos elementos alvo.
        *                                                                           O próprio conjunto de objetos alvo.
        * @param {Function}                     ev                                  Evento que será disparado.
        */
        SetActionOnEnter: function (o, ev) {
            // Resgata apenas os Inputs
            var fields = null;

            if (typeof (o) === 'string') { fields = Get(o + ' input'); }
            else if (o.constructor === Array) { fields = o; }
            else { fields = Get('input', o); }


            // Havendo campos encontrados
            if (fields != null && fields.length > 0) {

                // Evento que será adicionado nos campos encontrados
                var evt_Private_OnEnter = function (e) { if (e.keyCode == 13) { ev(); } };

                // Para cada campo Input
                for (var it in fields) {
                    var fld = fields[it];
                    var type = GetProp(fld, 'type', null);

                    switch (type) {
                        case 'datetime-local': case 'datetime': case 'date':
                        case 'month': case 'week': case 'time': case 'number':
                        case 'range': case 'email': case 'color': case 'tel':
                        case 'url': case 'text': case 'password':

                            fld.addEventListener('keyup', evt_Private_OnEnter, false);

                            break;
                    }
                }
            }
        },





        /**
        * Adiciona um script básico à tag output associada a um input[type="range"].
        *
        * @function SetRangeOutput
        *
        * @memberof Interface
        *
        * @param {String|Node|Node[]}           [o]                                 Seletor CSS para o node pai dos campos alvo.
        *                                                                           Objeto Node pai dos elementos alvo.
        *                                                                           O próprio conjunto de objetos alvo.
        *
        * @example Exemplo de marcação para um output
        *
        * <input type="range" id="iRange" min="0" max="100" step="1" data-simple-output="true" />
        * <output name="iRange_output" for="iRange"></output>
        */
        SetRangeOutput: function (o) {
            var ranges = null;
            var css = 'input[type="range"][data-simple-output="true"]';

            if (o === undefined) { ranges = Get(css); }
            else if (typeof (o) == 'string') { ranges = Get(o + ' ' + css); }
            else if (o.constructor === Array) { ranges = o; }
            else { ranges = (GetProp(o, 'type', null) == null) ? Get(css, o) : ranges = [o]; }


            // Havendo elementos alvo
            if (ranges != null && ranges.length > 0) {

                var evt_Private_RangeOutput = function (o) {
                    o = (o === undefined) ? this : (TypeOf(o) == '[object Event]') ? o.target : o;
                    var outName = o.getAttribute('id') + '_output';
                    var form = null;
                    var tempNode = o;


                    // Descobre o Form da tag atual
                    while (form == null || tempNode.tagName.toLowerCase() == 'html') {
                        if (tempNode.tagName.toLowerCase() == 'form') { form = tempNode; }
                        else { tempNode = tempNode.parentNode; }
                    }

                    // Sendo mesmo uma tag form
                    if (form != null) { form[outName].value = o.value; }
                };

                for (var it in ranges) {
                    ranges[it].addEventListener('input', evt_Private_RangeOutput, false);
                    evt_Private_RangeOutput(ranges[it]);
                }
            }
        },




        /**
        * Automatiza show/hide para dicas de preenchimento de campos de formulários.
        *
        * @function SetFieldTips
        *
        * @memberof Interface
        *
        * @param {String|Node|Node[]}           [o]                                 Seletor CSS para o node pai dos campos alvo.
        *                                                                           Objeto Node pai dos elementos alvo.
        *                                                                           O próprio conjunto de objetos alvo.
        *
        * @example Exemplo de marcação para uma dica
        *
        * <input type="text" id="iTeste" />
        * <div data-tipfor="iTeste">Dica para o input iTeste</div>
        */
        SetFieldTips: function (o) {
            var tips = null;

            if (o === undefined) { tips = Get('[data-tipfor]'); }
            else if (typeof (o) == 'string') { tips = Get(o + ' [data-tipfor]'); }
            else if (o.constructor === Array) { tips = o; }
            else {
                var type = GetProp(o, 'type', null);

                switch (type) {
                    case null:
                        tips = Get('[data-tipfor]', o);
                        break;

                    case 'input':
                    case 'textarea':
                    case 'select':
                        var id = GetProp(o, 'id', null);

                        if (id != null) {
                            tips = Get('[data-tipfor="' + id + '"]');
                        }

                        break;
                }
            }


            // Havendo elementos alvo
            if (tips != null && tips.length > 0) {


                // Evento que mostra a dica
                var evt_Private_ShowTip = function () {
                    // Resgata o campo de dica para o campo alvo
                    var target = Get('[data-tipfor="' + this.getAttribute('id') + '"]');
                    target[0].style.display = 'block';
                };


                // Evento que esconde a dica
                var evt_Private_HideTip = function () {
                    // Resgata o campo de dica para o campo alvo
                    var target = Get('[data-tipfor="' + this.getAttribute('id') + '"]');
                    target[0].style.display = 'none';
                };



                // Para cada dica encontrada...
                for (var it in tips) {
                    var tip = tips[it];
                    var elID = GetProp(tip, 'data-tipfor', null);

                    if (elID != null) {
                        var el = Get('#' + elID);

                        if (el != null) {
                            el.addEventListener('focus', evt_Private_ShowTip, false);
                            el.addEventListener('blur', evt_Private_HideTip, false);
                        }
                    }
                }
            }
        },





        /**
        * Inicia os contadores de caracteres para os campos alvo (input ou textarea).
        *
        * @function SetInputCounters
        *
        * @memberof Interface
        *
        * @param {String|Node|Node[]}           o                                   Seletor CSS para o node pai dos campos alvo.
        *                                                                           Objeto Node pai dos elementos alvo.
        *                                                                           O próprio conjunto de objetos alvo.
        * @param {Boolean}                      [r = true]                          Tipo de contagem : "true" = regressiva; "false" = progressiva
        *
        * @example Exemplo de marcação para um contador
        * O atributo "maxlength" deve estar setado
        *
        * <input type="text" id="iTeste" maxlength=""25 />
        * <div>Restam <span data-counterfor="iTeste"></span> caracteres</div>
        */
        SetInputCounters: function (o, r) {
            r = (r === undefined) ? true : r;
            var fields = null;

            if (typeof (o) === 'string') { fields = Get(o + ' input, ' + o + ' textarea'); }
            else if (o.constructor === Array) { fields = o; }
            else { fields = Get('input, textarea', o); }


            for (var it in fields) {
                var fld = fields[it];

                var id = GetProp(fld, 'id', null);
                var ml = GetProp(fld, 'maxlength', null);
                var el = fld.tagName.toLowerCase();

                // Apenas se o elemento contiver um ID e "maxlength" e ser um "input" ou um "textarea"
                if (id != null && ml != null && (el == 'input' || el == 'textarea')) {

                    // Encontrando o node de contagem do campo atual
                    var ctNode = Get('[data-counterfor="' + fld.getAttribute('id') + '"]');

                    if (ctNode != null && ctNode.length == 1) {
                        fld.setAttribute('data-type-counter', r);

                        // Evento que faz a contagem dos caracteres
                        var evt_Private_CountLength = function (f) {
                            f = (f === undefined) ? this : (TypeOf(f) == '[object KeyboardEvent]') ? f.target : f;
                            var tC = GetBooleanProp(f, 'data-type-counter', true);
                            var tNode = Get('[data-counterfor="' + f.getAttribute('id') + '"]');

                            var maxLen = GetProp(f, 'maxlength', null);
                            var valLen = f.value.length;

                            var iLeft = valLen;
                            if (tC) { iLeft = maxLen - valLen; }

                            tNode[0].textContent = iLeft;
                        };

                        // Seta evento no campo
                        fld.addEventListener('keyup', evt_Private_CountLength, false);
                        evt_Private_CountLength(fld);
                    }
                }
            }
        },





        /**
        * Para os campos select que possuem um campo auxiliar E tem mais de 20 itens
        * disponibiliza uma consulta rápida aos itens do mesmo.
        *
        * @function SetFastSelect
        *
        * @memberof Interface
        *
        * @param {String|Node|Node[]}           [o]                                 Seletor CSS para o node pai dos campos alvo.
        *                                                                           Objeto Node pai dos elementos alvo.
        *                                                                           O próprio conjunto de objetos alvo.
        * @param {Integer}                      [m = 20]                            Valor a partir do qual o campo de pesquisa rápida é habilitado.
        *
        * @example Exemplo de marcação para um output
        *
        * <select id="sFastSelect"> ... </select>
        * <input data-fastselect="sFastSelect" data-get="false" />
        */
        SetFastSelect: function (o, m) {
            var ifsel = null;
            var css = 'input[data-fastselect]';
            m = (m === undefined) ? 20 : m;

            if (o === undefined) { ifsel = Get(css); }
            else if (typeof (o) == 'string') { ifsel = Get(o + ' ' + css); }
            else if (o.constructor === Array) { ifsel = o; }
            else { ifsel = (GetProp(o, 'type', null) == null) ? Get(css, o) : ifsel = [o]; }


            // Havendo elementos alvo
            if (ifsel != null && ifsel.length > 0) {

                // Evento que faz o set do valor selecionado no select alvo
                var evt_Private_BlurFastSelect = function () {
                    var f = (f === undefined) ? this : (TypeOf(f) == '[object KeyboardEvent]') ? f.target : f;
                    var fsFor = GetProp(f, 'data-fastselect', '');
                    var sel = Get('#' + fsFor);
                    var val = f.value;

                    var opts = Get('option', sel);
                    for (var i = 0; i < opts.length; i++) {
                        if (val == opts[i].textContent) {
                            sel.selectedIndex = i;
                        }
                    }
                };


                for (var it in ifsel) {
                    var inp = ifsel[it];
                    var fsFor = GetProp(inp, 'data-fastselect', '');
                    var sel = Get('#' + fsFor);
                    var opts = Get('option', sel);

                    if (opts != null && opts.length >= m) {
                        inp.setAttribute('list', fsFor + '_datalist');

                        var ndlist = document.createElement('datalist');
                        ndlist.setAttribute('id', fsFor + '_datalist');

                        for (var i in opts) {
                            if (opts[i].value != '') {
                                var nopt = document.createElement('option');
                                nopt.setAttribute('value', opts[i].textContent);
                                ndlist.appendChild(nopt);
                            }
                        }

                        inp.parentNode.appendChild(ndlist);
                        inp.addEventListener('input', evt_Private_BlurFastSelect, false);
                    }
                }
            }

        },





        /**
        * Seta comandos para adicionar ou remover itens selecionados entre selects multiplos.
        *
        * @function SetMultipleSelectCommands
        *
        * @memberof Interface
        *
        * @param {String|Node|Node[]}           o                                   Seletor CSS para o node pai dos campos alvo.
        *                                                                           Objeto Node pai dos elementos alvo.
        *                                                                           O próprio conjunto de objetos alvo.
        *
        * @example Exemplo de marcação para um selects multiplos em conjunto.
        * <select multiple="multiple" id="sMulti_dataorigin" data-get="false"> ... option[] ... </select>
        *
        * <a id="sMulti_add">Adicionar selecionados</a>
        * <a id="sMulti_remove">Remover selecionados</a>
        *
        * <select multiple="multiple" id="sMulti"> ... option[] ... </select>
        */
        SetMultipleSelectCommands: function (o) {
            var fields = null;
            var mSelects = [];

            if (typeof (o) === 'string') { fields = Get(o + ' select'); }
            else if (o.constructor === Array) { fields = o; }
            else { fields = Get('select', o); }


            // Resgata apenas os selects multiplos válidos
            for (var it in fields) {
                var fld = fields[it];
                var m = GetBooleanProp(fld, 'multiple', false);
                var g = GetBooleanProp(fld, 'data-get', true);

                // Se for um campo select multiplo ... 
                if (m && g) {
                    // e, se ele possui um par
                    if (Get('#' + fld.getAttribute('id') + '_dataorigin') != null) {
                        mSelects.push(fld);
                    }
                }
            }


            if (mSelects.length > 0) {


                /**
                * Remove um ou mais nodes <option> selecionados de um select e transfere-o para outro select alvo.
                *
                * @function CMD_MoveOptionsBetweenSelects
                *
                * @private
                */
                var CMD_MoveOptionsBetweenSelects = function () {
                    var btn = this.getAttribute('id');
                    var oSel = '';
                    var tSel = '#';

                    var add = null;

                    // Identifica o ID do select Base e se está adicionando ou removendo options do mesmo
                    if (btn.indexOf('_add') != -1) { tSel += btn.replace('_add', ''); add = true; }
                    else { tSel += btn.replace('_remove', ''); add = false; }
                    oSel = tSel + '_dataorigin';


                    var oSel = Get(oSel);                   // Select de origem de dados
                    var tSel = Get(tSel);                   // Select alvo dos dados selecionados
                    var opts = [];                          // Opções do select que está "perdendo"
                    var moveOpts = [];                      // Opções que serão movidas


                    // Conforme a ação que está sendo executada...
                    if (add) { var opts = Get('option', oSel); }
                    else { var opts = Get('option', tSel); }


                    // Para cada option do select base
                    for (var it in opts) {
                        if (opts[it].selected == true) { moveOpts.push(opts[it]); }
                    }


                    // Para cada option que está sendo movido...
                    for (var it in moveOpts) {
                        var o = moveOpts[it];

                        var nOpt = document.createElement('option');
                        nOpt.setAttribute('value', o.getAttribute('value'));
                        nOpt.textContent = o.textContent.ReplaceAll('&', '*§*').ReplaceAll('*§*', '&amp;');

                        if (add) {
                            tSel.appendChild(nOpt);
                            oSel.removeChild(o);
                        }
                        else {
                            oSel.appendChild(nOpt);
                            tSel.removeChild(o);
                        }
                    }
                };




                // Para cada select multiplo selecionado
                for (var it in mSelects) {
                    var mS = mSelects[it];
                    var bID = '#' + mSelects[it].getAttribute('id');

                    Get(bID + '_add').addEventListener('click', CMD_MoveOptionsBetweenSelects, false);
                    Get(bID + '_remove').addEventListener('click', CMD_MoveOptionsBetweenSelects, false);
                }
            }
        },





        /**
        * Define um possível estado de uma senha.
        *
        * @typedef PasswordState
        *
        * @private
        *
        * @memberof Interface
        *
        * @property {String}                    Message                             Mensagem explicativa do estado.
        * @property {String}                    Class                               Classe que será setada nos elementos HTML.
        */





        /**
        * Conjunto de configurações para efetuar a verificação de senha.
        *
        * @typedef PasswordCheckConfig
        *
        * @private
        *
        * @memberof Interface
        *
        * @property {PasswordState}             NullPassword                        Senha não informada.
        * @property {PasswordState}             InvalidChar                         Sets para caso de caracter inválido.
        * @property {PasswordState}             Short                               Senha muito curta.
        * @property {PasswordState}             VeryWeak                            Senha muito fraca.
        * @property {PasswordState}             Week                                Senha fraca.
        * @property {PasswordState}             Relevant                            Senha relevante.
        * @property {PasswordState}             Strong                              Senha forte.
        * @property {PasswordState}             VeryStrong                          Senha muito forte.
        * @property {Integer}                   MinLength                           Tamanho mínimo em caracteres que a senha deve ter.
        */
        PasswordCheckConfig: {
            NullPassword: { Message: '', Class: 'jsp-inactive-or-null-password' },
            InvalidChar: { Message: Labels.PasswordInvalidChar, Class: 'jsp-invalid-password' },
            Short: { Message: Labels.PasswordShort, Class: 'jsp-short-password' },
            VeryWeak: { Message: Labels.PasswordVeryWeak, Class: 'jsp-very-weak-password' },
            Week: { Message: Labels.PasswordWeak, Class: 'jsp-weak-password' },
            Relevant: { Message: Labels.PasswordRelevant, Class: 'jsp-relevant-password' },
            Strong: { Message: Labels.PasswordStrong, Class: 'jsp-strong-password' },
            VeryStrong: { Message: Labels.PasswordVeryStrong, Class: 'jsp-very-strong-password' },
            MinLength: String.Pattern.World.Password.MinLength,
            SetClassOnInput: false
        },





        /**
        * Testa a força de uma senha e, conforme as configurações seta classe de verificação
        * tanto no "input" alvo quanto no "node" de mensagem.
        *
        * @function SetCheckPasswordStrength
        *
        * @memberof Interface
        *
        * @param {String|Node|Node[]}           o                                   Seletor CSS para o node pai dos campos alvo.
        *                                                                           Objeto Node pai dos elementos alvo.
        *                                                                           O próprio conjunto de objetos alvo.
        * @param {PasswordCheckConfig}          cfg                                 Configurações para a verificação da senha.
        *
        * @example Exemplo de campo de senha verificado.
        * <input type="password" id="iPassword" class="shortpass" />
        * <div data-strength-of="iPassword class="shortpass">Senha muito curta</div>
        */
        SetCheckPasswordStrength: function (o, cfg) {
            var fields = null;
            cfg = (cfg === undefined) ? {} : cfg;

            // Efetua mescla dos dados informados pelo desenvolvedor com as configurações padrões
            var config = CloneObject(Interface.PasswordCheckConfig);
            for (var it in cfg) { config[it] = cfg[it]; }


            if (typeof (o) === 'string') { fields = Get(o + ' input'); }
            else if (o.constructor === Array) { fields = o; }
            else { fields = Get('input', o); }


            if (fields != null && fields.length > 0) {

                var pass = [];
                for (var it in fields) {
                    var type = GetProp(fields[it], 'type', null);
                    if (type == 'password') { pass.push(fields[it]); }
                }


                // Resgata todas classes utilizadas
                var classToRemove = [];
                for (var it in config) {
                    if (config[it].Class !== undefined) {
                        classToRemove.push(config[it].Class);
                    }
                }



                /**
                * Efetua a verificação da senha digitada.
                *
                * @function evt_Private_CheckPasswordStrength
                *
                * @private
                */
                var evt_Private_CheckPasswordStrength = function () {
                    var val = this.value.toString();
                    var pField = this;
                    var nAlert = Get('[data-strength-of="' + this.getAttribute('id') + '"]')[0]; //Get('#' + this.getAttribute('id') + '_strength');


                    /**
                    * Seta mensagem no campo de alerta e/ou adiciona classe no input alvo.
                    *
                    * @function setMessageOnField
                    *
                    * @private
                    *
                    * @param {PasswordState}        pst                         Objeto do estado a ser setado.
                    */
                    var setMessageOnField = function (pst) {
                        SetClass(pField, pst.Class, classToRemove);
                        SetClass(nAlert, pst.Class, classToRemove);
                        nAlert.textContent = pst.Message;
                    };


                    /**
                    * Verifica se a senha possui apenas caracteres válidos.
                    *
                    * @function isValidPassword
                    *
                    * @private
                    *
                    * @param {String}               sC                          Classe que será setada.
                    * @param {String}               sM                          Mensagem a ser setada.
                    */
                    var isValidPassword = function () {
                        var chars = val.IsPassword(true);
                        if (chars != '') {
                            setMessageOnField({
                                Message: config.InvalidChar.Message.replace('{chars}', chars),
                                Class: config.InvalidChar.Class
                            });
                        }
                        return ((chars == '') ? true : false);
                    };


                    // Se não há senha digitada...
                    if (val.length == 0) {
                        setMessageOnField({
                            Message: nAlert.getAttribute('data-pass-text'),
                            Class: config.NullPassword.Class
                        });
                    }
                    else {
                        // Se senha é menor que o mínimo exigido
                        if (val.length < config.MinLength) {
                            setMessageOnField(config.Short);
                            isValidPassword();
                        }
                        // Senão, se a senha tem o tamanho mínimo e é válida
                        else {
                            if (isValidPassword() == true) {

                                // Classifica força da senha
                                var state = null;
                                var strgt = val.PasswordStrength();

                                // Senha Muito Fraca
                                if (strgt <= 60) { state = config.VeryWeak; }
                                // Senha Fraca
                                else if (strgt <= 80) { state = config.Week; }
                                // Senha Relevante
                                else if (strgt <= 100) { state = config.Relevant; }
                                // Senha Forte
                                else if (strgt <= 160) { state = config.Strong; }
                                // Senha Muito Forte
                                else if (strgt > 160) { state = config.VeryStrong; }

                                setMessageOnField(state);
                            }
                        }
                    }
                };




                // para cada input password encontrado
                for (var it in pass) {
                    var p = pass[it];

                    // Armazena o texto atual num atributo especial do próprio node de alerta
                    var nodeAlert = Get('[data-strength-of="' + p.getAttribute('id') + '"]'); //Get('#' + p.getAttribute('id') + '_strength');
                    if (nodeAlert != null && nodeAlert.length == 1) {
                        var n = nodeAlert[0];
                        n.setAttribute('data-pass-text', n.textContent);

                        // Seta evento no keyup
                        p.addEventListener('keyup', evt_Private_CheckPasswordStrength, false);
                    }
                }
            }
        },





        /**
        * Verifica se a senha redigitada bate com a do primeiro input de senha
        *
        * @function SetCheckRetypePassword
        *
        * @memberof Interface
        *
        * @param {String|Node|Node[]}           o                                   Seletor CSS para o node pai dos campos alvo.
        *                                                                           Objeto Node pai dos elementos alvo.
        *                                                                           O próprio conjunto de objetos alvo.
        *
        * @example Exemplo de campo de senha verificado.
        * <input type="password" id="iPassword" class="shortpass" />
        * <input type="password" id="iPassword_retype" class="shortpass" data-get="false" />
        */
        SetCheckRetypePassword: function (o) {
            var fields = null;

            if (typeof (o) === 'string') { fields = Get(o + ' input[type="password"]'); }
            else if (o.constructor === Array) { fields = o; }
            else { fields = Get('input[type="password"]', o); }


            // Havendo elementos encontrados
            if (fields != null && fields.length > 0) {


                // Evento que valida o segundo input de senha
                var evt_Private_OnRetype = function () {
                    var id = this.id.replace('_retype', '');
                    var inp = Get('#' + id);
                    var check = Get('#' + id + '_retype');

                    var val = inp.value;
                    var retype = check.value;
                    var valid = (val == '') ? 'null' : ((val == retype) ? 'true' : 'false');

                    check.setAttribute('data-valid', valid);
                };


                for (var it in fields) {
                    var id = GetProp(fields[it], 'id', '');
                    var inp = Get('#' + id);
                    var check = Get('#' + id + '_retype');

                    // Identificando o input de verificação
                    if (check != null) {
                        check.addEventListener('keyup', evt_Private_OnRetype, false);
                        inp.addEventListener('keyup', evt_Private_OnRetype, false);
                    }
                }

            }
        },





        /**
        * Prepara os inputs do formulário alvo para utilizarem os recursos desta classe.
        * A validação nativa do navegador é desativada para não entrar em conflito com a da classe.
        * Todas as formas de envio de dados por parte dos botões normais ficará bloqueado .
        *
        * @function SetFormFeatures
        *
        * @memberof Interface
        *
        * @param {String|Node|Node[]}           o                                   Seletor CSS para o node pai dos campos alvo.
        *                                                                           Objeto Node pai dos elementos alvo.
        *                                                                           O próprio conjunto de objetos alvo.
        */
        SetFormFeatures: function (o) {
            var form = null;
            var fields = null;



            if (typeof (o) === 'string') {
                form = Get(o);
                fields = Get('input, select, textarea', form);
            }
            else if (o.constructor === Array) {
                fields = o;
                if (fields.length > 0) {

                    var tnode = fields[0];
                    while (form == null) {
                        var pTag = tnode.tagName.toLowerCase();
                        if (pTag == 'form') { form = tnode.parentNode; }
                        tnode = tnode.parentNode;
                    }
                }
            }
            else { fields = Get('input, select, textarea', o); }




            // Apenas se encontrar algum campo
            if (fields != null && fields.length > 0) {


                // Função para retorno false
                var ReturnFalseFunction = function () { return false; };

                // Desabilita validação nativa dos navegadores
                form.setAttribute('novalidate', 'novalidate');
                form.addEventListener('submit', ReturnFalseFunction, false);


                // Ativa dicas.
                Interface.SetFieldTips(form);

                // Ativa output para range simples
                Interface.SetRangeOutput(form);

                // Ativa contadores.
                Interface.SetInputCounters(form);

                // Ativa seleção rápida para selects com grande número de options
                Interface.SetFastSelect(form);

                // Ativa select multiplos
                Interface.SetMultipleSelectCommands(form);

                // Ativa testadores de força de senha
                Interface.SetCheckPasswordStrength(form);

                // Ativa retype de input de senha
                Interface.SetCheckRetypePassword(form);



                // Efetua a formatação dos valores do campo quando este perder o foco
                var evt_Private_FieldFormatOnBlur = function (o) {
                    o = Forms.FieldElement(o.target);
                    o.self.value = o.def.Format(o.value, undefined, o.decimal);
                };



                // Para cada campo passível de ser validado
                for (var it in fields) {
                    var fld = Forms.FieldElement(fields[it]);

                    // Para textareas, e inputs válidos
                    if (fld.tagName == 'textarea' || (fld.tagName == 'input' &&
                        fld.type != 'password' && fld.type != 'radio' && fld.type != 'checkbox')) {

                        if (fld.def != null && fld.def.MaxLength != null) {
                            fld.self.setAttribute('maxlength', fld.def.MaxLength);
                        }


                        // Se for um tipo que é para validar, adiciona ação de validação 
                        if (fld.validate && fld.type != 'range') {
                            //var list = (fld.type == 'url' || fld.type == 'number') ? 'blur' : 'keyup';
                            fld.self.addEventListener('keyup', Forms.FieldValidate, false);

                            // Nestes dois casos só efetua a formatação ao 'blur'
                            if (fld.type == 'url' || fld.type == 'number') {
                                fld.self.addEventListener('blur', evt_Private_FieldFormatOnBlur, false);
                            }
                        }
                    }
                }
            }
        }
    };







    // Adiciona métodos locais aos métodos do objeto Interface
    for (var it in newInterfaceMethods) { Interface[it] = newInterfaceMethods[it]; }



    return static;
});