require('dotenv/config');

const url = 'https://bibleapi.co/api';
const token = process.env.BIBLE_API_TOKEN;

let { extrairReferencias, RefInvalida } = require('./referenciaBiblica');
let { ErrorHandler } = require('./ErrorHandler');

function numSuperscrito(num) {
    var lista = String(num).split('');
    var sup = [];
    for (var n of lista) {
        sup.push("⁰¹²³⁴⁵⁶⁷⁸⁹"[Number(n)]);
    }
    return sup.join('');
}

function versiculosParaString(versiculos) {
    return versiculos.map((v, i) => {
        if (v instanceof RefInvalida)
            return '################# Referência Inválida #################'
        var r = '';
        var l = v.livro;
        var c = '\n\n' + v.cap;
        if (i === 0)
            r += r + c;
        else
            if (v.livro !== versiculos[i-1].livro)
                r += '\n\n' + l + c;
            else if (v.cap !== versiculos[i-1].cap)
                r += c;
        r += ' ' + numSuperscrito(v.vers) + ' ' + v.texto;
        return r;
    })
}

async function getTextoBiblico(str, versao = 'nvi', next, toString = false) {
    
    let versoes = require('./Versoes.json');
    
    const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    if (!versoes.map(v => v.abreviacao).includes(versao))
        throw new ErrorHandler(404, `Versão informada (${versao}) não existe.`);
    versao = versoes.filter(v => v.abreviacao === versao)[0].version;

    let query;
    let versiculos = [];
    let contadorRef = 0;
    let finalizado = false;
    try{
        let _ = await identificarReferencia(str);
    } catch (e) {
        return e;
    }
    while (!finalizado) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (toString) versiculos = versiculosParaString(versiculos)
    return versiculos;
    
    async function identificarReferencia (str) {
        var refer = [...extrairReferencias(str)];
        if (refer.length === 1 && !refer[0].cap) 
            versiculos = [new RefInvalida(str)];
        else {
            let _ = await requestVersos(refer);
        }
    }

    async function requestVersos(ref) {
        referenciaLimpa = getReferenciaLimpa(ref);
        for (var i = 0; i < ref.length; i++) {
            if (ref[i].inicial === -1) {
                continue;
            } else if (ref[i].inicial === 1) {
                if (ref[i+1].inicial !== -1) {
                    ref[i].inicial = 0;
                } else {
                    for (var j = ref[i].cap; j <= ref[i+1].cap; j++) {
                        let _ = await montarQuery(ref[i], versao, i + j/100, j, [ref[i].cap, ref[i].vers, ref[i+1].cap, ref[i+1].vers]);
                    }
                }
            } else {
                let _ = await montarQuery(ref[i], versao, i);
            }
        }
        tratarVersiculos()
    }

    function getReferenciaLimpa(ref) {
        var r = '';
        for (var i = 0; i < ref.length; i++){
            if (!eReferencia(ref[i]))
                continue;
            if (i === 0 || ref[i].livro !== ref[i-1].livro)
                r = r + ref[i].livro.name + ' ' + ref[i].cap + (ref[i].vers ? ':' + ref[i].vers : '');
            else {
                if (ref[i].cap !== ref[i-1].cap) {
                    r = r + ref[i].cap;
                    r = r + (ref[i].vers === null ? '' : ':' + ref[i].vers);
                } else {
                    r = r + ref[i].vers;
                }
            }
            r = r + (ref[i].inicial === 1 ? '-' : i === ref.length-1 ? '' : ', ');
        }
        return r;
    }

    function eReferencia(ref) {
        if ('livro' in ref || 'cap' in ref)
            return ref.livro !== null && ref.cap !== null;
        return false;
    }

    async function montarQuery (ref, versao, ordem, cap = null, filtro = null) {  
        contadorRef++;
        if (!eReferencia(ref)) {
            versiculos.push({versos: new RefInvalida(ref.strInicial), ordem: ordem});
        } else { 
            query = [url, "verses",
                    versao,
                    ref.livro.abbrevPt,
                    cap || ref.cap,
                    ref.inicial === 0 && ref.vers !== null ? ref.vers : null,
                    ].join('/')
            let _ = await getVersiculos(query, filtro, ordem, ref.strInicial)
        }
    }
    
    async function getVersiculos(query, filtro, ordem, strInicial) {

        var bibleApi = new XMLHttpRequest()
        bibleApi.filtro = filtro;
        bibleApi.addEventListener('load', () => {
            let lastVersiculos;
            var resp = JSON.parse(bibleApi.responseText);
            var filtro = bibleApi.filtro;
            if(!resp.book) lastVersiculos = new RefInvalida(strInicial);
            else {
                if (resp.hasOwnProperty('verses')) {
                    lastVersiculos = resp.verses.map(v => ({vers: v.number, texto: v.text, versiculoSuperscrito: numSuperscrito(v.number)}))
                    for (var x of lastVersiculos) {
                        x.cap = resp.chapter.number ;
                        x.livro = resp.book.name;
                    }
                    if (filtro !== null) {
                        lastVersiculos = lastVersiculos.filter(
                            v => (((v.cap > filtro[0] || v.vers >= filtro[1]) || (v.cap >= filtro[0] && filtro[1] == null)) &&
                            ((v.cap < filtro[2] || v.vers <= filtro[3]) || (v.cap <= filtro[2] && filtro[3] == null)))
                        )
                    }
                } else  
                    lastVersiculos = {cap: resp.chapter, livro: resp.book.name, vers: resp.number, texto: resp.text};
            }
            versiculos.push({versos: lastVersiculos, ordem});
            tratarVersiculos();
        });
        
        bibleApi.open('GET', query);
        bibleApi.setRequestHeader("Authorization", "Bearer " + token)
        let _ = await bibleApi.send();
    }

    function tratarVersiculos() {
        if (versiculos.length !== contadorRef) return;
        versiculos = versiculos.sort((a, b) => {
            if(a.ordem < b.ordem) {
                return -1;
            } else if(a.ordem > b.ordem) {
                return 1;
            } else {
                return 0;
            }
        })
        versiculos = versiculos.flatMap(v => v.versos);
        finalizado = true;
    }
    
    // function versiculosValidos(versiculos) {
    //     var validos = []
    //     for (var v of versiculos) {
    //         if (v instanceof RefInvalida) continue;
    //         validos.push(v);
    //     }
    //     return validos;
    // }
}

module.exports = getTextoBiblico