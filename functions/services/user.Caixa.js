const admin = require('firebase-admin');

module.exports = {

    novaCaixa: async function(request, response){
        const idCaixa =  request.body.idCaixa;
        const idUsuario = request.body.idUsuario;
        const dbUsuario = admin.firestore().collection("Usuario").doc(idUsuario);
        const dbCaixa = admin.firestore().collection("Caixa").doc(idCaixa);
        const mudarCliente = request.body.mudarCliente;
        let caixaCadastrada = {};

        await dbCaixa.get()
            .then(function(doc){
                caixaCadastrada = {
                    emailCliente: doc.data().emailCliente,
                    celularCliente: doc.data().celularCliente,
                    nome: doc.data().nome,
                    id: doc.data().id
                }; 
            })
            .catch(function(err){
                response.status(404).json({
                    response: false,
                    msg: "caixa "+ idCaixa +" Não encontrada: "
                });
            })
            
        if(caixaCadastrada.emailCliente !== "null" && !mudarCliente){
            response.status(304).json({
                response: false,
                msg: "caixa "+ idCaixa + " já foi cadastrada"
            });
            return;
        }

        let usuarioCadastrado = {};
        
        await dbUsuario.get()
            .then(function(doc){
                usuarioCadastrado = {
                    alarmes: doc.data().alarmes,
                    caixas: doc.data().caixas,
                    login: doc.data().login
                }
            })
            .catch(function(err){
                response.status(404).json({
                    response: false,
                    msg: "Usuario "+ idUsuario +" Não encontrada: "
                });
            })
        
        usuarioCadastrado.caixas.push({
            id: idCaixa,
            nome: request.body.nomeCaixa
        });

        caixaCadastrada = {
            emailCliente: usuarioCadastrado.login.email,
            celularCliente: usuarioCadastrado.login.celular,
            nome: request.body.nomeCaixa,
            id: idCaixa
        }

        await dbCaixa.update(caixaCadastrada)
            .catch(function(err){
                response.status(304).json({
                    response: false,
                    msg: "erro ao salvar informacoes da Caixa!" + err,
                });
            })

        await dbUsuario.update(usuarioCadastrado)
            .catch(function(err){
                response.status(304).json({
                    response: false,
                    msg: "erro ao salvar informacoes do Usuario!" + err,
                });
            }) 
        
        response.status(200).json({
            response: true,
            msg: "Caixa adicionada com sucesso!",
        });
        
    },

    atualizaCaixa: function(request, response){
        const velhaCaixa = {
            nomeCaixa: request.body.velhaCaixa.nomeCaixa,
            id: request.body.velhaCaixa.id,
        }
        const novaCaixa = {
            nomeCaixa: request.body.novaCaixa.nomeCaixa,
            id: request.body.novaCaixa.id, 
        };
        const id = request.body.idUsuario;
        const dbCaixa = admin.firestore().collection("Usuario").doc(id);
        let data = {};
        
        dbCaixa.get()
        .then(function(doc){
            let modificou = false;
            data = {
                alarmes: doc.data().alarmes,
                caixas: doc.data().caixas,
                login: doc.data().login
            }
            data.caixas.forEach((caixa) => {
                if(caixa.id === velhaCaixa.id){
                    caixa.id = novaCaixa.id;
                    caixa.nomeCaixa = novaCaixa.nomeCaixa;
                    modificou = true
                }
            });
            if(!modificou){
                response.status(404).json({
                    response: false,
                    msg: "Caixa não encontrada!",
                });
                return;
            }
            dbCaixa.update(data)
            .then(function(){
                response.status(200).json({
                    response: true,
                    msg: "Caixa modificada com sucesso!",
                });
            })
            .catch(function(err){
                response.status(304).json({
                    response: false,
                    msg: "Caixa não modificada!" + err,
                });
            })  
        })
    }
};