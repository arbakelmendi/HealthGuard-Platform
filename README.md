README – HealthGuard Platform

HealthGuard Platform është një aplikacion web që synon të ndihmojë përdoruesit të monitorojnë dhe menaxhojnë shëndetin e tyre përmes:
    regjistrimit të të dhënave personale
    analizimit të rrezikut shëndetësor
    rekomandimeve bazuar në të dhëna

1. Qëllimi kryesor
Të ndërtohet një platformë funksionale ku përdoruesit mund të:
    krijojnë llogari (Sign Up)
    kyçen (Login)
    ruajnë dhe menaxhojnë të dhënat personale
    marrin insights bazuar në të dhëna
    
2. Qëllime teknike
Implementimi i një authentication system (JWT)
Ndërtimi i një REST API me .NET
Përdorimi i një database reale (SQL Server / SQLite)
Integrimi i frontend me backend (React + API)
Strukturim i projektit sipas Clean Architecture

4. Qëllime akademike
Aplikimi i koncepteve të:
    Software Engineering
    Data Management
    API Design
Ndërtimi i një sistemi që mund të zgjerohet me:
    Machine Learning
    Health analytics


Projekti është i ndarë në 2 pjesë kryesore:
   Backend (ASP.NET Core)
        REST API
        Authentication (JWT)
        Database connection
        Business logic
   Frontend (React + TypeScript)
        UI/UX
        Forms (Login / Signup)
        State management (AuthContext)
        API communication


Platforma përdor:
  JWT (JSON Web Token) për autentikim
  BCrypt për hashimin e password-it
Flow:
  User bën Sign Up
Backend:
  ruan user-in në databazë
  hashon password-in
  User bën Login
Backend:
  verifikon credentials
  gjeneron JWT token
Frontend:
  ruan token në localStorage
  përdor token për request-a të mbrojtura

