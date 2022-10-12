require('dotenv').config()
const express = require('express');
const PORT = process.env.PORT || 3030;
const path = require('path');
const mongoose = require('mongoose');
const Event = require('./models/event.js');
const bodyParser = require('body-parser');
const nodemailer = require("nodemailer");
const methodOverride = require('method-override');
const cron = require("node-cron");
const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASS;
const dbURL = `mongodb+srv://${dbUser}:${dbPass}@ludicrumdb.t4kwz0x.mongodb.net/?retryWrites=true&w=majority`
const app = express();
// 'mongodb://localhost:27017/elibrary'

mongoose.connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true }).then(console.log("connected to DB")).catch((error) => console.log(error.message));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('X-HTTP-Method-Override'))

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

cron.schedule('* * 1 * * *', async () => {
    try {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate());
        await Event.deleteMany({ dateEnd: { $lt: cutoff } });
    } catch (error) {
        console.log("Nažalost došlo je do pogreške.", error);
    }
});

app.post('/uspjesnaObjava', async (req, res) => {
    try {
        const event = new Event(req.body.event);
        await event.save();
        res.redirect('/uspjesnaObjava');
    } catch (error) {
        res.send("Nažalost došlo je do pogreške, molimo pokušajte kasnije.", error);
    }
});

app.get('/', (req, res) => {
    try {
        res.render('pocetna', { title: "Ludicrum - Početna stranica", description: "Ludicrum nudi vrlo jednostavnu i potpuno besplatnu uslugu pregledavanja i objavljivanja raznih zabavnih događaja na području cijele Republike Hrvatske" });
    } catch (error) {
        res.send("Nažalost došlo je do pogreške, molimo pokušajte kasnije.", error);
    }
});

app.get('/dogadaji', async (req, res) => {
    try {
        const { date, city, category } = req.query;
        if (!city && !date && !category) {
            try {
                const events = await Event.find({ published: 'true' }).sort('-datePublished').limit(10);
                const eventNumber1 = await Event.count({ published: 'true' });
                const eventNumber = "Ukupno objavljenih događaja: " + eventNumber1;
                const text = "Najnoviji događaji";
                const firstText = "Pretražite događaje prema mjestu, datumu i/ili kategoriji";
                res.render('dogadaji', { events, text, firstText, eventNumber, title: "Ludicrum - Pregledaj događaje u blizini", description: "Jednostavan pregled zabavnih događaja i filtriranje prema mjestu, datumu i/ili kategoriji" });
            } catch (error) {
                res.send("Nažalost došlo je do pogreške, molimo pokušajte kasnije.", error);
            }
        } else if (city && date && category) {
            try {
                const stringDate = date.toString() + 'T00:00:00.000Z';
                const events = await Event.find({
                    published: 'true', city: city, category: category, dateStart: { $lte: stringDate }, dateEnd: { $gte: stringDate }
                }).sort('-datePublished');
                const eventNumber1 = await Event.count({
                    published: 'true', city: city, category: category, dateStart: { $lte: stringDate }, dateEnd: { $gte: stringDate }
                });
                const eventNumber = "Pronađenih događaja: " + eventNumber1;
                const firstText = "Pregled događaja prema zadanim filterima:";
                const text = ""
                res.render('dogadaji', { events, text, firstText, eventNumber, title: "Ludicrum - Pregledaj događaje u blizini", description: "Jednostavan pregled zabavnih događaja i filtriranje prema mjestu, datumu i/ili kategoriji" });
            } catch (error) {
                res.send("Nažalost došlo je do pogreške, molimo pokušajte kasnije.", error);
            }
        } else if (city && !date && !category) {
            try {
                const events = await Event.find({ published: 'true', city: city }).sort('-datePublished');
                const eventNumber1 = await Event.count({ published: 'true', city: city });
                const eventNumber = "Pronađenih događaja: " + eventNumber1;
                const text = ""
                const firstText = "Pregled događaja prema zadanim filterima:";
                res.render('dogadaji', { events, text, firstText, eventNumber, title: "Ludicrum - Pregledaj događaje u blizini", description: "Jednostavan pregled zabavnih događaja i filtriranje prema mjestu, datumu i/ili kategoriji" });
            } catch (error) {
                res.send("Nažalost došlo je do pogreške, molimo pokušajte kasnije.", error);
            }
        } else if (!city && date && !category) {
            try {
                const stringDate = date.toString() + 'T00:00:00.000Z';
                const events = await Event.find({
                    published: 'true', dateStart: { $lte: stringDate }, dateEnd: { $gte: stringDate }
                }).sort('-datePublished');
                const eventNumber1 = await Event.count({
                    published: 'true', dateStart: { $lte: stringDate }, dateEnd: { $gte: stringDate }
                });
                const eventNumber = "Pronađenih događaja: " + eventNumber1;
                const text = ""
                const firstText = "Pregled događaja prema zadanim filterima:";
                res.render('dogadaji', { events, text, firstText, eventNumber, title: "Ludicrum - Pregledaj događaje u blizini", description: "Jednostavan pregled zabavnih događaja i filtriranje prema mjestu, datumu i/ili kategoriji" });
            } catch (error) {
                res.send("Nažalost došlo je do pogreške, molimo pokušajte kasnije.", error);
            }
        } else if (!city && !date && category) {
            try {
                const events = await Event.find({ published: 'true', category: category }).sort('-datePublished');
                const eventNumber1 = await Event.count({ published: 'true', category: category });
                const eventNumber = "Pronađenih događaja: " + eventNumber1;
                const text = "";
                const firstText = "Pregled događaja prema zadanim filterima:";
                res.render('dogadaji', { events, text, firstText, eventNumber, title: "Ludicrum - Pregledaj događaje u blizini", description: "Jednostavan pregled zabavnih događaja i filtriranje prema mjestu, datumu i/ili kategoriji" });
            } catch (error) {
                res.send("Nažalost došlo je do pogreške, molimo pokušajte kasnije.", error);
            }
        } else if (city && date && !category) {
            try {
                const stringDate = date.toString() + 'T00:00:00.000Z';
                const events = await Event.find({
                    published: 'true', city: city, dateStart: { $lte: stringDate }, dateEnd: { $gte: stringDate }
                }).sort('-datePublished');
                const eventNumber1 = await Event.count({
                    published: 'true', city: city, dateStart: { $lte: stringDate }, dateEnd: { $gte: stringDate }
                });
                const eventNumber = "Pronađenih događaja: " + eventNumber1;
                const text = "";
                const firstText = "Pregled događaja prema zadanim filterima:";
                res.render('dogadaji', { events, text, firstText, eventNumber, title: "Ludicrum - Pregledaj događaje u blizini", description: "Jednostavan pregled zabavnih događaja i filtriranje prema mjestu, datumu i/ili kategoriji" });
            } catch (error) {
                res.send("Nažalost došlo je do pogreške, molimo pokušajte kasnije.", error);
            }
        } else if (city && !date && category) {
            try {
                const events = await Event.find({ published: 'true', city: city, category: category }).sort('-datePublished');
                const eventNumber1 = await Event.count({ published: 'true', city: city, category: category });
                const eventNumber = "Pronađenih događaja: " + eventNumber1;
                const text = "";
                const firstText = "Pregled događaja prema zadanim filterima:";
                res.render('dogadaji', { events, text, firstText, eventNumber, title: "Ludicrum - Pregledaj događaje u blizini", description: "Jednostavan pregled zabavnih događaja i filtriranje prema mjestu, datumu i/ili kategoriji" });
            } catch (error) {
                res.send("Nažalost došlo je do pogreške, molimo pokušajte kasnije.", error);
            }
        } else if (!city && date && category) {
            try {
                const stringDate = date.toString() + 'T00:00:00.000Z';
                const events = await Event.find({ published: 'true', dateStart: { $lte: stringDate }, dateEnd: { $gte: stringDate }, category: category }).sort('-datePublished');
                const eventNumber1 = await Event.count({ published: 'true', dateStart: { $lte: stringDate }, dateEnd: { $gte: stringDate }, category: category });
                const eventNumber = "Pronađenih događaja: " + eventNumber1;
                const text = "";
                const firstText = "Pregled događaja prema zadanim filterima:";
                res.render('dogadaji', { events, text, firstText, eventNumber, title: "Ludicrum - Pregledaj događaje u blizini", description: "Jednostavan pregled zabavnih događaja i filtriranje prema mjestu, datumu i/ili kategoriji" });
            } catch (error) {
                res.send("Nažalost došlo je do pogreške, molimo pokušajte kasnije.", error);
            }
        }

    } catch (error) {
        res.send("Nažalost došlo je do pogreške, molimo pokušajte kasnije.", error);
    }
});

app.get('/oNama', (req, res) => {
    try {
        res.render('oNama', { title: "Ludicrum - O nama", description: "Ludicrum nudi vrlo jednostavnu i potpuno besplatnu uslugu pregledavanja i objavljivanja raznih zabavnih događaja na području cijele Republike Hrvatske" });
    } catch (error) {
        res.send("Nažalost došlo je do pogreške, molimo pokušajte kasnije.", error);
    }
});

app.get('/kontakt', (req, res) => {
    try {
        res.render('kontakt', { title: "Ludicrum - Kontaktirajte nas", description: "Ovim putem možete kontaktirati naš tim koji će Vam odgovoriti u što kraćem roku" });
    } catch (error) {
        res.send("Nažalost došlo je do pogreške, molimo pokušajte kasnije.", error);
    }
});

app.get('/uspjesanKontakt', (req, res) => {
    try {
        res.render('uspjesanKontakt', { title: "Ludicrum - Poruka poslana", description: "Vaša poruka je uspješno poslana" });
    } catch (error) {
        res.send("Nažalost došlo je do pogreške, molimo pokušajte kasnije.", error);
    }
});

app.post("/kontakt", async (req, res) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS,
        },
    });

    const mailOptions = {
        from: req.body.contactEmail,
        to: "ludicrum.ludicrum@gmail.com",
        subject: `${req.body.contactName}: ${req.body.contactSubject}`,
        text: `Mail poslan od ${req.body.contactEmail}, poruka je: ${req.body.contactMessage}`
    }

    transporter.sendMail(mailOptions, (error, responose) => {
        if (error) {
            console.log(error);
            res.send("Nažalost došlo je do pogreške, molimo pokušajte kasnije.", error)
        } else {
            res.redirect('/uspjesanKontakt');
        }
    });
});

app.get('/objavi', (req, res) => {
    try {
        res.render('objavi', { title: "Ludicrum - Objavite događaj", description: "Ovim putem jednostavno objavite Vaš događaj, koji će biti vidljiv u roku od 48 sati" });
    } catch (error) {
        res.send("Nažalost došlo je do pogreške, molimo pokušajte kasnije.", error);
    }
});

app.get('/uvjetiKoristenja', (req, res) => {
    try {
        res.render('uvjetiKoristenja', { title: "Ludicrum - Uvjeti korištenja i pravila privatnosti", description: "Ludicrum Uvjeti korištenja i pravila privatnosti" });
    } catch (error) {
        res.send("Nažalost došlo je do pogreške, molimo pokušajte kasnije.", error);
    }
});

app.get('/uspjesnaObjava', (req, res) => {
    try {
        res.render('uspjesnaObjava', { title: "Ludicrum - Uspješna objava", description: "Vaš događaj je uspješno objavljen i biti će vidljiv u roku od 48 sati" });
    } catch (error) {
        res.send("Nažalost došlo je do pogreške, molimo pokušajte kasnije.", error);
    }
});

app.get('/dogadaji/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const dogadaj = await Event.findById(id);
        res.render('detalji', { dogadaj, title: `Ludicrum - ${dogadaj.title}`, description: `${dogadaj.title}, ${dogadaj.city}, ${dogadaj.date}, ${dogadaj.category}, ${dogadaj.location} ` });
    } catch (error) {
        res.send("Nažalost došlo je do pogreške, molimo pokušajte kasnije.", error);
    }
});

app.all('*', (req, res) => {
    try {
        res.render('stranicaNijePronadena', { title: "Ludicrum - Stranica ne postoji", description: "Nažalost ne možemo pronaći ovu stranicu u našoj bazi" });
    } catch (error) {
        res.send("Nažalost došlo je do pogreške, molimo pokušajte kasnije.", error);
    }
});

app.listen(PORT, () => {
    console.log(`server started on port ${PORT}`);
});