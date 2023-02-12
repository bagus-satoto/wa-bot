var os = require("os");
var fs = require("fs");
const wa = require('@open-wa/wa-automate');
const config = require('./config.json')

const { default: PQueue } = require("p-queue");
const queue = new PQueue({ concurrency: 2, timeout: 1000 });


var longMsg = `Selamat pagi teman-teman Calon Mahasiswa Universitas Amikom Yogyakarta
Untuk link pendaftaran Kuliah Umum Daring / Online dan Pelatihan Super Unggul ( PSU ) Daring / Online sudah bisa diakses ya, silahkan bisa melakukan pendaftaran melalui link Pendaftaran dibawah ini

*-KEGIATAN MAHASISWA BARU-*

*1. Kuliah Umum Daring / Online*
*Pendaftaran :* bit.ly/kuliahumumamikom
Jadwal tertera di link.
Cp : 088213000444

*2. Pelatihan Super Unggul Daring / Online*
(Masuk dalam 2 sks matakuliah wajib bernama Etika Profesi)
*Pendaftaran :* bit.ly/daftarpsu21
Link Pendaftaran di buka setiap Selasa (09.00) - Jumat (15.00).

*3. Penggalian Potensi Mahasiswa*
(Pengganti ospek)
*Info pendaftaran :* https://www.instagram.com/p/CC5bHTYJMqU/?utm_source=ig_web_copy_link
Cp : 0859131338568

*Apabila ada pertanyaan silahkan bisa langsung menghubungi CP yang sudah tertera*

Terimakasih☺️

*Untuk mengikuti Kegiatan Kuliah Umum dan PSU tidak harus membayar biaya Registrasi terlebih dahulu*

Link pendaftaran juga sudah admin cantumkan pada Deskripsi Grup WA ini`

var can_used = ['6281229904389@c.us', '6283164600533@c.us']

var chats = ['6282136094607--1620437196@g.us','6282136094607-1558389407@g.us']
var welcomeStatus = true

// var chats = ['6281229904389-1558389407@g.us'] // Gabut

const welcome = async (client, chat, whos) => {
    if (welcomeStatus) {
        await client.sendTextWithMentions(chat, `${whos} selamat datang di amikom`)
        await client.sendText(chat, 'Silahkan daftar psu dan kuliah umum di link bawah ini')
        await client.sendLinkWithAutoPreview(chat, "https://www.instagram.com/p/CC5bHTYJMqU/?utm_source=ig_web_copy_link", longMsg)
        await client.sendLinkWithAutoPreview(chat, "http://wa.me/6282136094607", `Jika ada pertanyaan bisa langsung menuju link ini http://wa.me/6282136094607
*Catatan:* Perkenalkan diri dulu diajak ngobrol baru tanya tanya.`)
        await client.sendText(chat, 'Boleh memperkenalkan diri terlebih dahulu di grup.Supaya lebih akrab sama yang lain.')
    }
}

wa.create(config).then(client => start(client));

function start(client) {
    client.onAnyMessage(async message => {
        var admins = []
        chats.map(async chat => {
            let admin = await client.getGroupAdmins(chat)
            admins = [...admins, ...admin]
        })
        if (message.sender) {
            if (can_used.includes(message.sender.id)) {
                if (message.body == '/exit') {
                    await client.sendText(message.chat.id, 'Service telah diberhentikan.')
                    process.exit()
                }
                if (message.body == '/stop') {
                    await client.sendText(message.chat.id, 'Service telah diberhentikan sementara.')
                    welcomeStatus = false
                }
                if (message.body == '/start') {
                    await client.sendText(message.chat.id, 'Service telah dijalankan kembali.')
                    welcomeStatus = true
                }
            }
            if ([...can_used, ...admins].includes(message.sender.id)) {
                let body = message.body
                if (body.startsWith('/welcome ')) {
                    await queue.add(_ => welcome(client, message.chat.id, message.body.replace('/welcome ', '')))
                }
            }
        }
    });
    client.onGlobalParticipantsChanged(async participantChangedEvent => {
        if (chats.includes(participantChangedEvent.chat)) {
            if (participantChangedEvent.action == 'add') {
                let {
                    chat,
                    who
                } = participantChangedEvent
                let infogrup = await client.getGroupInfo(participantChangedEvent.chat)

                await queue.add(_ => welcome(client, chat, `@${who.replace('@c.us','')}`))


                // const data = fs.readFileSync('grups.txt', 'utf8')
                // if (!data.includes(infogrup.title)) {
                //     fs.open('grups.txt', 'a', 666, (e, id) => {
                //         fs.write(id, `${infogrup.title} ::: ${participantChangedEvent.chat}` + os.EOL, null, 'utf8', function () {
                //             fs.close(id, function () {
                //                 // console.log('file is updated');
                //             });
                //         });
                //     });
                // }
            } else if (participantChangedEvent.action == 'remove') {
                await queue.add(_ => client.sendText(participantChangedEvent.chat, 'Selamat tinggal kawan.Semoga hari-harimu menyenangkan.'))
            }
        }

    })
}