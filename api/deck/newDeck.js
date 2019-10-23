const crawler=require('./crawlerDeckCodes')
const cheerio=require('cheerio')
const addCards=require('../card/addCards')
const addDeck=require('./addDeck')
const getDeckId=require('./getDeckId')

//새로운 덱 추가
//return : response status code
exports.NewDeck=(req,res)=>{
    const deckOwner=req.session.sid
    //덱 이름이 주어지지 않았다면 시간으로 저장
    const deckTitle=req.body.deckTitle || new Date()
    let deckCode=req.body.deckCode
    let cards=[]

    //덱 코드가 입력 되었는지 체크
    const DataCheck=()=>{
        return new Promise((resolve,reject)=>{
            if(!deckCode){
                return reject({
                    code: 'request_body_error',
                    message: 'request body is not defined'
                })
            }
            else resolve()
        })
    }
    //덱 코드를 가지고 deck.codes 크롤링, 성공시 html을 resolve해줌
    const CrawlPage=()=>{
        return crawler.Crawl(deckCode)
    }
    //받아온 html로부터 덱을 구성하는 카드정보 추출
    const DeckCrawl=(result)=>{
        const $=cheerio.load(result)
        //카드의 코스트 배열
        let cardCosts=$('div.hs-tile-info').children('.hs-tile-info-left.mdc-list-item__start-detail')
        //카드의 이름 배열
        // let cardNames=$('div.hs-tile-info').find('span').find('span')
        let cardNames=$('div.hs-tile-info').find('span.hs-tile-info-middle.mdc-list-item__text')
        //카드가 들어간 개수 배열
        let cardNums=$('div.hs-tile-info').children('.hs-tile-info-right.mdc-list-item__end-detail')

        for(let i=0;i<cardNames.length;i++) {
            let cardCost=$(cardCosts[i]).text()
            let cardName=$(cardNames[i]).text().trim()
            let cardNum=$(cardNums[i]).text()
            //카드의 개수가 1개라면, 웹에서는 카드의 개수를 공백으로 표현함.
            //카드의 개수가 1개가 아니라 2개여도 양 옆 공백이 상당하기 때문에,
            //trim()을 우선 사용하고, 결과에 대해서 문자열을 다듬음
            if(cardNum.trim()==='')
                cardNum='1'
            else
                cardNum=cardNum.trim()
            if(cardName === '???'){
                cardCost = 3
                cardName = 'SN1P-SN4P'
                cardNum = 1
            }
            cards.push({cardCost: cardCost, cardName: cardName, cardNum: cardNum})
        }
    }
    //deck 테이블에 새로운 row 추가
    const AddDeck=()=>{
        const asyncAddDeck=async ()=>{
            try{
                await addDeck.AddDeck(deckOwner,deckTitle,deckCode)
            }
            catch (err) {
                throw err
            }
        }
        return asyncAddDeck()
    }
    //카드를 추가하기 위해 방금 추가한 덱 id를 가져옴
    const GetId=()=>{
        const asyncGetDeckId=async ()=>{
            try{
                const results=await getDeckId.GetDeckId(deckOwner,deckTitle)
                return results
            }
            catch (err){
                throw err
            }
        }
        return asyncGetDeckId()
    }
    //card 테이블에 새로운 여러개의 row 추가
    const AddCards=(deckId)=>{
        return addCards.AddCards(deckId,cards)
    }

    DataCheck()
        .then(CrawlPage)
        .then(DeckCrawl)
        .then(AddDeck)
        .then(GetId)
        .then(AddCards)
        .then(()=>{
            res.status(200).json({message:'Complete Adding Deck'})
        })
        .catch((err)=>{
            console.log(err)
            res.status(500).json(err || err.message)
        })
}