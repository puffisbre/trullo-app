
# Trullo-app av Felix Olsson Stenersjö

### Motivera ditt val av databas.
Valde MongoDB mest för att jag blivit van vid den på senaste. Men också enkelheten i att använda den. Det är även enkelt att sätta upp och komma igång snabbt, samt att mongoose är ett väldigt bra paket. Skulle även säga när det är sånt här mindre projekt så är det alltid bättre att använda NoSQL databaser generellt just för att det är så smidigt med setup och koppling.

### Redogör vad de olika teknikerna (ex. verktyg, npm-paket, etc.) gör i applikationen
 
Ok så jag satte upp en standard applikation för NodeJS. Express, Ts-Node och dotenv var mina grund-paket. Har även mongoose för MongoDB och bcrypt för hash av lösenord. Sen har jag några paket som heter @types/*paketnamn*, dessa är för TypeScript så att jag kan typa olika saker utan att få error.

Express för enklare hantering av routes, middlewares + requests och responses. 

Ts-Node för att "skippa" behöva kompilera TypeScript filerna till JavaScript, paketet gör att jag kan köra de direkt. Kompileringen sker istället i minnet med Ts-Node paketet.

Dotenv använder jag för säkerhet. Att kunna gömma databas-strängar eller databasnamn har blivit en självklarhet nu. Det blir även smidigt om man ska ha ha olika host-addresser. Tex om du är på olika datorer (eller jobbar med andra). Då kan du ha lokala env-filer som har olika strängar, men i koden heter fortfarande variablerna desamma.


### Redogör översiktligt hur applikationen fungerar

env-variabler:

```json
MONGODB_URI=CONNECTION-STRING
DB_NAME=DATABASE NAME
JWT_SECRET=RANDOM JWT STRING
NODE_ENV=development
```

Appen är väldigt simpel just nu. Du kan köra den med "npm run dev" så startar servern. Sen går du in på Thunderclient eller liknande applikationer (Postman, Insomnia etc) och kan köra olika routes. 

http//:localhost:3000/users för att hantera users.
http//:localhost:3000/tasks för att hantera tasks.

Rekommenderat att skapa en user först så att du kan assigna en User direkt. Går förstås att lägga till i efterhand med put. 

När du skapar en User så ska du ha ett namn, unikt email som inte redan finns i databasen och ett lösenord som är minst 8 tecken långt. 

Exempel på User:
```json
{
    "name":"Felix",
    "email":"test@test.com",
    "password":"mypassword123"
}
```

Har lagt till en authentication middleware som gör att du måste vara inloggad för att göra något alls med tasks. Så du är "låst" från tasks om du inte är inloggad och du kan bara hämta den inloggades tasks. Du loggar in med  email och password:

http//:localhost:3000/users/login för login

```json
{
    "email":"test@test.com",
    "password":"mypassword123"
}
```

Du kan lägga en task på en annan user och updatera en taks, men du kommer inte åt och se andras tasks när den väl är skapad så det är inte helt perfekt, men på god väg.

Thunderclient i VScode hade inget bra sätt att hantera cookies så var tvungen att lägga till en logout också för att rensa cookien:

http//:localhost:3000/users/logout

När du skapar en Task så ska du ha en title, description, status (som är en enum, tar bara emot "to-do", "in progress", "blocked", "done"), assignedTo som tar emot ett id från databasen och finishedAt som uppdateras med hjälp av middlewares.

Exempel på Task:

```json
{ 
"title": "Clean", 
"description": "Clean your house by the end of the month", 
"status": "in progress", 
"assignedTo": "USER-ID" 
} 
```

Både User och Task har GET/POST/PUT/DELETE.
PUT har så att du behöver bara ett fält att uppdatera. Tex:

http//:localhost:3000/tasks/:id

```json
{
    "title":"Wash"
}
```

Har även lagt till timestamps på både User och Task schemas så att de får en createdAt och updatedAt. 

Har lagt till en seedfil med hjälp av ChatGpt, kör den med kommandot:

```json
{
    npm run seed
}
```

Testa gärna runt!
