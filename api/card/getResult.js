const getCardId=require('./getCardId')
const cheerio=require('cheerio')
const request = require('request')
const fs=require('fs')
const ejs=require('ejs')
const mysql=require('../../database/mysql')
let globalMulligan
let globalDecks
var globalDeckCode
var globalCardArray

//result.ejs 렌더링 전 수행됨. 현재 덱 ID와 상대 직업을 가지고 상대의 점유율 상위 3개 덱과, 내 덱의 추천 멀리건 출력
//return : 렌더링 된 result.ejs
exports.GetResult=(req,res)=>{
    const deckId=req.session.deckId
    const opponentClass=req.session.opponentClass
    //덱 ID와 상대 직업 정보 체크
    const DataCheck=()=>{
        return new Promise((resolve,reject)=>{
            if (!deckId || !opponentClass){
                return reject({
                    code:'query_error',
                    message:'query error',
                })
            }
            resolve()
        })
    }
    //현재 덱ID를 바탕으로 카드정보 가져오기
    // return : cardid <json array>
    const GetCardId=()=>{
        return getCardId.GetCardId(deckId)
    }

const getDeckCode = async (deckNumber)=>{
    console.log('getDeckCode 시작!')
    let deckCode
    return new Promise((resolve, reject)=>{
        mysql.getConnection((err,connection)=>{
            if (err) throw err
            connection.query(`select deckCode from deck where id=\'${deckNumber}\'`, (err,results,fields)=>{
                if (err) throw err
                deckCode = results[0].deckCode
                console.log('쿼리 결과 : ' + deckCode)
                resolve(deckCode)
            })
            connection.release()
        })
    })
        
}

    //가져온 카드 정보를 바탕으로, hsreplay.net에서, 덱 검색하기,
    // -> 내 덱의 코드를 반환
    // return : <array>
    const GetDeckURL=async (cardIds)=>{
        for(let i =0; i < cardIds.length; i++){
            cardIds[i] = cardIds[i].cardId
        }
        globalCardArray = cardIds
        let myDeckCode
        myDeckCode = await getDeckCode(deckId)
        .then((DeckCode)=>{return DeckCode})
        .then(async (DeckCode)=>{
            myDeckCode = DeckCode
            console.log('리퀘스트 전 덱코드 : ' + myDeckCode)
            return myDeckCode
        })
        .then((myDeckCode)=>{
            return new Promise(async (resolve,reject)=>{
                console.log('프로미스 리턴 후 : ' + myDeckCode)
                globalDeckCode = myDeckCode
                resolve(myDeckCode)
            })
        })
    }
    const findnameById = (dbf_id)=>{
        const url = 'https://api.hearthstonejson.com/v1/latest/koKR/cards.collectible.json'
        request(url, (err, res, data)=>{
            if(err) throw err
            const content = JSON.parse(data)
            for(let i=0; i<content.length; i++){
                if(content[i].dbfId === dbf_id){
                    return content[i].name
    }
  }
        })
    }
    //덱 코드를 받아오고 덱의 URL 및 카드 이름과 멀리건 부분 추출
    const GetMulligan= async (myDeckCode)=> {
        myDeckCode = globalDeckCode
        console.log('리퀘스트 진입?!' + myDeckCode)
        await request(`https://hs.protolambda.com/${myDeckCode}`, (err, res, data)=>{
                console.log('리퀘스트 진입!')
                if(err) throw err
                const $ = cheerio.load(data)
                let heroimage = $('#main-inner > div.decklist-code > div:nth-child(2) > span > a')
                let herotext = heroimage.text().trim().split(' ')[0]
                console.log('직업 : ' + herotext)
                request('https://hsreplay.net/analytics/query/list_decks_by_win_rate/?GameType=RANKED_STANDARD&RankRange=ALL&Region=ALL&TimeRange=LAST_30_DAYS', (err, res, data)=>{
                    if(err) throw err
                    let content = JSON.parse(data)
                    if(herotext === 'Druid')
                        content = content.series.data.DRUID
                    else if(herotext === 'Shaman')
                        content = content.series.data.SHAMAN
                    else if(herotext === 'Warrior')
                        content = content.series.data.WARRIOR
                    else if(herotext === 'Hunter')
                        content = content.series.data.HUNTER
                    else if(herotext === 'Paladin')
                        content = content.series.data.PALADIN
                    else if(herotext === 'Warlock')
                        content = content.series.data.WARLOCK
                    else if(herotext === 'Priest')
                        content = content.series.data.PRIEST
                    else if(herotext === 'Mage')
                        content = content.series.data.MAGE
                    else if(herotext === 'Rogue')
                        content = content.series.data.ROGUE

                    for(let i=0; i< content.length; i++){
                        let decklist = content[i].deck_list
                        decklist = decklist.substr(2, content[i].deck_list.length-4).split('],[')
                        for(let t=0; t<decklist.length; t++){
                            decklist[t] = decklist[t].split(',')[0]
                        }
                        if(globalCardArray.every((item)=>{
                            return decklist.includes(item)
                        }) && globalCardArray.length != 0
                        ){
                            myDeckURL = decklist[i].deck_id
                        }
                    }
                })

            })

        const url = `https://hsreplay.net/analytics/query/single_deck_mulligan_guide/?GameType=RANKED_STANDARD&RankRange=ALL&Region=ALL&PlayerInitiative=ALL&deck_id=${myDeckURL}`
            console.log('url : ' + url)
            let cards=[]
            request(url, (err, res, data)=>{
                // if(err) throw err
                console.log('변환 전 : ' + typeof data)
                const content = JSON.parse(data)
                console.log('변환 후 : ' + typeof content)
                let successor = content.series.data.ALL // <array>
                for(let i = 0; i < successor.length; i++){
                    let dbf_id = successor[i].dbf_id
                    let opening_hand_winrate = successor[i].opening_hand_winrate
                    let cardName = findnameById(dbf_id)
                    cards.push({'cardName':cardName, 'cardWinRate':opening_hand_winrate})
                }
            })
        return new Promise((resolve,reject)=>{
            
            
            //카드를 멀리건 승률 순서대로 정렬 : 내림차순
            cards.sort((a,b)=>{
                return a.opening_hand_winrate < b.opening_hand_winrate ? 1:-1
            })
            resolve(cards)
        })
    }
    //상대 직업을 가지고 hsreplay.net에서 검색, 점유율 상위 3개의 덱을 반환
    const GetOppContent=()=>{
        const url = 'https://hsreplay.net/analytics/query/list_decks_by_win_rate/?GameType=RANKED_STANDARD&RankRange=ALL&Region=ALL&TimeRange=LAST_30_DAYS'
        let card_list=[]
        request(url, (err, res, body)=>{
            if(err) console.log('에러 : ' + err)
            const content = JSON.parse(body)
            if(opponentClass == 'DRUID')
                card_list = content.series.data.DRUID
            else if(opponentClass == 'SHAMAN')
                card_list = content.series.data.SHAMAN
            else if(opponentClass == 'WARRIOR')
                card_list = content.series.data.WARRIOR
            else if(opponentClass == 'ROGUE')
                card_list = content.series.data.ROGUE
            else if(opponentClass == 'PALADIN')
                card_list = content.series.data.PALADIN
            else if(opponentClass == 'HUNTER')
                card_list = content.series.data.HUNTER
            else if(opponentClass == 'WARLOCK')
                card_list = content.series.data.WARLOCK
            else if(opponentClass == 'MAGE')
                card_list = content.series.data.MAGE
            else if(opponentClass == 'PRIEST')
                card_list = content.series.data.PRIEST
            console.log('card_list_1 : ' + card_list)
        })
        return new Promise((resolve,reject)=>{
                const asyncFunc=async ()=>{
                    console.log('card_list_2 : ' + card_list)

                    let temp_list = []
                    for(let i=0; i < card_list.length; i++){
                        temp_list.push(card_list[i])
                    }
                    temp_list.sort((a, b)=>{ // 카드를 점유율 순으로 정렬 : 내림차순
                        return a.win_rate < b.win_rate ? 1 : -1
                    })
                    const topThreeDeck = []
                    for(let n=0; n<3; n++){
                        topThreeDeck.push(temp_list[n])
                    }
                    console.log('return전 topThreeDeck : ' + topThreeDeck)
                    return topThreeDeck
                    }
            resolve(asyncFunc())
        })
    }
    // 아키타입 id로 덱의 이름 검색 후 반환
    const findTitleByArchetype = async (archetype_id)=>{
        const url = 'https://hsreplay.net/api/v1/archetypes/?format=json&hl=ko'
        request(url, (err, res, data)=>{
            if(err) throw err
            const content = JSON.parse(data)
            for(let i = 0; i < content.length; i++){
                if(content[i].id === archetype_id)
                    return content[i].name
            }
        })
    }
    //점유율 상위 3개 덱의 json을 받아온 뒤 덱의 이름, 게임 횟수 추출
    const GetOppDeckInfo=(topThreeDeck)=>{
        console.log('topThreeDeck : ' + topThreeDeck)
        let decks=[]
        return new Promise((resolve,reject)=>{
            for(let i=0; i<topThreeDeck.length; i++){
                deckTitle = findTitleByArchetype(topThreeDeck[i].archetype_id)
                deckGame = topThreeDeck[i].total_games
                decks.push({deckTitle : deckTitle, deckGame : deckGame})
            }
            resolve(decks)
        })
    }
    DataCheck()
        .then(GetCardId)
        //.then(CrawlerMulligan)
        .then(GetDeckURL)
        .then(GetMulligan)
        .then((cards)=>{
            return new Promise((resolve,reject)=>{
                globalMulligan=cards
                resolve()
            })
        })
        .then(GetOppContent)
        .then(GetOppDeckInfo)
        .then((decks)=>{
            return new Promise((resolve,reject)=>{
                globalDecks=decks
                resolve()
            })
        })
        .then(()=>{
            return new Promise((resolve,reject)=>{
                let result={}
                result.cards=globalMulligan
                result.decks=globalDecks
                resolve(result)
            })
        })
        .then((result)=>{
            fs.readFile('./views/ejs/result.ejs','utf-8',(err,data)=>{
                res.writeHead(200,{'Content-Type':'text/html'})
                res.end(ejs.render(data,{
                    cards:globalMulligan || [],
                    decks:globalDecks || [],
                }))
            })
        })
        .catch((err)=>{
            console.log(err)
        })
}