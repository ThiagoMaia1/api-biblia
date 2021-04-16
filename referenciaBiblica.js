class referenciaBiblica {
    constructor(str, inicial = 0, livro = null, cap = null, vers = null, temLivro = false) {
        this.str = str;
        this.strInicial = str;
        this.livro = livro;
        this.cap = cap;
        this.vers = vers;
        this.inicial = inicial;
        this.temLivro = temLivro;
    }

}

class RefInvalida {
    constructor(str) {
        this.cap = null; 
        this.livro = null; 
        this.vers = null; 
        this.texto = 'Referência Inválida: "' + str + '"';
    }
}

module.exports = {
    RefInvalida,
    extrairReferencias: 
        function(strReferencia) {
            const livros = require('./Livros.json')
            var referencias = [];
            //Limpa a string da referência.    
            strReferencia = strReferencia.trim().toLowerCase().replace(/[:.+]/g,':').replace(/[;,+]/g,',');
            strReferencia = strReferencia.replace(/(?<=,):+/g,'')
            strReferencia = strReferencia.replace(/[^áàâãéèêíïóôõöúçña-z0-9:\-,\s]/g,'');
            strReferencia = strReferencia.replace(/(?<=[03-9])\s+(?=[áàâãéèêíïóôõöúçña-z])/g,',');
            strReferencia = strReferencia.replace(/\s/g,"");
            strReferencia = strReferencia.replace(/[áàâãéèêíïóôõöúçña-z](?=[0-9])/g,'$& ');

            var subReferencias = strReferencia.split(',').filter(r => r !== '');
            for (var i = 0; i < subReferencias.length; i++) {
                if (subReferencias[i].includes('-')) {
                    var arr = subReferencias[i].split('-');
                    referencias.push(new referenciaBiblica(arr[0], 1));
                    referencias.push(new referenciaBiblica(arr[1], -1));
                } else {
                    referencias.push(new referenciaBiblica(subReferencias[i]));
                }
            }
            
            for (i = 0; i < referencias.length; i++) {
                if (!temLivro(referencias[i].str) && i > 0) {
                    referencias[i].livro = referencias[i-1].livro;
                } else {
                    arr = referencias[i].str.split(' ');
                    referencias[i].temLivro = true;
                    referencias[i].livro = extrairLivro(arr[0])
                    referencias[i].str = (arr[1] === undefined ? '' : arr[1]);
                }
                if (referencias[i].livro !== null && referencias[i].str !== '') {
                    if (referencias[i].livro.chapters === 1) {
                        referencias[i].cap = 1;
                    } else {
                        var c = getCap(referencias, i)
                        referencias[i].cap = (c > referencias[i].livro.chapters ? null : c);
                    }
                    referencias[i].vers = getVers(referencias, i);
                    if (referencias[i].inicial === -1) {
                        if (referencias[i].cap < referencias[i-1].cap || (referencias[i].cap === referencias[i-1].cap && referencias[i].vers < referencias[i-1].vers)) {
                            //Gerar alerta de erro
                            referencias[i-1].inicial = 0;
                            referencias[i].inicial = 0;
                        }
                    }
                }
            }

            return referencias;
                    
            function temLivro(str) {
                var reg = /[a-z]/;
                return (reg.test(str));
            }

            function getCap(arr, index) {
                if (index < 0) {
                    return false;
                }
                if (arr[index].str.includes(':')) {
                    return parseInt(arr[index].str.split(':')[0]);
                } else if (temCap(arr, index)) {
                    return parseInt(arr[index].str) 
                } else {
                    return getCap(arr, index-1);
                }
            }

            function getVers(arr, index) {
                if (index < 0) {
                    return false;
                }
                if (arr[index].str.includes(':')) {
                    return parseInt(arr[index].str.split(':')[1]);
                } else if (temVers(arr, index)) {
                    return parseInt(arr[index].str) 
                } else {
                    return null;
                }
            }

            function temCap(arr, index) {
                if (index < 0) {
                    return false;
                }
                if (arr[index].str.includes(':')) {
                    return true;
                } else if (arr[index].temLivro) {
                    if (arr[index].livro.chapters === 1) {
                        return false
                    } else {
                        return true
                    }
                } else {
                    return (!temVers(arr, index-1)); 
                }
            }

            function temVers(arr, index) {
                if (index < 0) {
                    return false;
                }
                if (arr[index].str.includes(':')) {
                    return true;
                } else if (arr[index].temLivro) {
                    if (arr[index].livro.chapters === 1) {
                        return true
                    } else {
                        return false
                    }
                } else {
                    return (temVers(arr, index-1)); 
                }
            }

            function extrairLivro(refLivro) {

                var livro;
                
                var i = refLivro.length
                do {
                    refLivro = refLivro.substr(0,i);
                    livro = acharLivro(refLivro);
                    i--;
                } while (livro === null && i > 1)

                return livro;
            }

            function acharLivro(trecho) {
                for (var item of livros) {
                    if (item.abbrevPt.localeCompare(trecho) === 0) {
                        return item;
                    }
                }
                for (item of livros) {
                    if (item.abbrev.filter(a=>(trecho.localeCompare(a) === 0)).length > 0) {
                        return item;
                    }
                }
                return null;
            }
        }
}
