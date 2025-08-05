const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Demo için rastgele maç sonuçları ve istatistikler oluşturur
async function generateDemoData() {
  try {
    console.log('🚀 Demo veriler oluşturuluyor...')

    // Tüm kullanıcıları al
    const users = await prisma.user.findMany({
      select: {
        id: true,
        teamName: true,
        sport: true,
        city: true,
        rating: true
      }
    })

    if (users.length < 2) {
      console.log('❌ En az 2 kullanıcı olmalı!')
      return
    }

    console.log(`📊 ${users.length} takım bulundu`)

    // Her kullanıcı için rastgele maç geçmişi oluştur
    for (let i = 0; i < users.length; i++) {
      const user = users[i]
      const matchCount = Math.floor(Math.random() * 8) + 2 // 2-10 maç arası

      console.log(`⚽ ${user.teamName} için ${matchCount} maç oluşturuluyor...`)

      for (let j = 0; j < matchCount; j++) {
        // Rastgele rakip seç (kendisi hariç)
        const opponents = users.filter(u => u.id !== user.id && u.sport === user.sport)
        if (opponents.length === 0) continue

        const opponent = opponents[Math.floor(Math.random() * opponents.length)]

        // Rastgele skor oluştur
        const myScore = Math.floor(Math.random() * 5)
        const opponentScore = Math.floor(Math.random() * 5)

        // Rating değişimi hesapla
        const won = myScore > opponentScore
        const ratingChange = won ? Math.floor(Math.random() * 5) + 1 : -Math.floor(Math.random() * 3)

        // Rastgele tarih (son 3 ay içinde)
        const randomDate = new Date()
        randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 90))

        // Maç geçmişi oluştur
        await prisma.matchHistory.create({
          data: {
            team1Id: user.id,
            team2Id: opponent.id,
            score1: myScore,
            score2: opponentScore,
            location: getRandomLocation(),
            date: randomDate,
            rating1: user.rating,
            rating2: opponent.rating
          }
        })

        // Activity oluştur
        const activityTitle = won ? 'Maç Kazandın! 🎉' : 'Maç Kaybettin 😔'
        const activityDescription = `${opponent.teamName} takımına karşı ${myScore}-${opponentScore} ${won ? 'kazandın' : 'kaybettin'}`

        await prisma.activity.create({
          data: {
            userId: user.id,
            type: won ? 'MATCH_WON' : 'MATCH_LOST',
            title: activityTitle,
            description: activityDescription,
            metadata: {
              opponent: opponent.teamName,
              score: `${myScore}-${opponentScore}`,
              ratingChange: ratingChange
            }
          }
        })
      }

      // Kullanıcının rating'ini güncelle
      const matchHistories = await prisma.matchHistory.findMany({
        where: {
          OR: [
            { team1Id: user.id },
            { team2Id: user.id }
          ]
        }
      })

      let totalRatingChange = 0
      matchHistories.forEach(match => {
        if (match.team1Id === user.id) {
          const won = match.score1 > match.score2
          totalRatingChange += won ? 2 : -1
        } else {
          const won = match.score2 > match.score1
          totalRatingChange += won ? 2 : -1
        }
      })

      const newRating = Math.max(10, Math.min(100, user.rating + totalRatingChange))

      await prisma.user.update({
        where: { id: user.id },
        data: { rating: newRating }
      })

      console.log(`✅ ${user.teamName}: ${matchHistories.length} maç, yeni rating: ${newRating}`)
    }

    // Bazı rastgele aktiviteler ekle
    console.log('🎯 Ek aktiviteler oluşturuluyor...')
    
    for (const user of users) {
      // Platform join aktivitesi
      await prisma.activity.create({
        data: {
          userId: user.id,
          type: 'PLATFORM_JOIN',
          title: 'Platforma Hoş Geldin! 👋',
          description: 'MatchMaker ailesine katıldın!'
        }
      })

      // Rastgele ek aktiviteler
      const extraActivities = Math.floor(Math.random() * 3)
      for (let i = 0; i < extraActivities; i++) {
        const activityTypes = ['MATCH_CREATED', 'REQUEST_SENT', 'CHAT_STARTED']
        const randomType = activityTypes[Math.floor(Math.random() * activityTypes.length)]
        
        await prisma.activity.create({
          data: {
            userId: user.id,
            type: randomType,
            title: getActivityTitle(randomType),
            description: getActivityDescription(randomType)
          }
        })
      }
    }

    console.log('🎉 Demo veriler başarıyla oluşturuldu!')
    console.log('📈 Kullanıcıların yeni istatistikleri:')
    
    const updatedUsers = await prisma.user.findMany({
      include: {
        _count: {
          select: {
            matchHistory1: true,
            matchHistory2: true
          }
        }
      }
    })

    updatedUsers.forEach(user => {
      const totalMatches = user._count.matchHistory1 + user._count.matchHistory2
      console.log(`🏆 ${user.teamName}: ${totalMatches} maç, Rating: ${user.rating}`)
    })

  } catch (error) {
    console.error('❌ Hata:', error)
  } finally {
    await prisma.$disconnect()
  }
}

function getRandomLocation() {
  const locations = [
    'Florya Metin Oktay Tesisleri',
    'BJK Nevzat Demir Tesisleri',
    'Galatasaray Kemerburgaz Tesisleri',
    'Fenerbahçe Can Bartu Tesisleri',
    'TFF Hasan Doğan Milli Takımlar Tesisleri',
    'Maltepe Spor Kompleksi',
    'Ataşehir Spor Salonu',
    'Kadıköy Spor Merkezi',
    'Beşiktaş Sahil Spor Tesisleri',
    'Sarıyer Spor Kompleksi'
  ]
  return locations[Math.floor(Math.random() * locations.length)]
}

function getActivityTitle(type) {
  switch (type) {
    case 'MATCH_CREATED':
      return 'Yeni Maç İlanı Verdin 📢'
    case 'REQUEST_SENT':
      return 'Takıma İstek Gönderdin 📤'
    case 'CHAT_STARTED':
      return 'Yeni Sohbet Başladı 💬'
    default:
      return 'Aktivite'
  }
}

function getActivityDescription(type) {
  switch (type) {
    case 'MATCH_CREATED':
      return 'Hazırlık maçı için ilan verdin, takımlar sana istek gönderebilir.'
    case 'REQUEST_SENT':
      return 'Bir takıma maç isteği gönderdin, yanıtlarını bekliyorsun.'
    case 'CHAT_STARTED':
      return 'Kabul edilen istek sonrası sohbet odası açıldı.'
    default:
      return 'Bir aktivite gerçekleşti.'
  }
}

// Script'i çalıştır
generateDemoData()
