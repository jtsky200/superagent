// @ts-nocheck
// 🌐 CADILLAC EV CIS - Internationalization System
// Swiss market multi-language support (DE, FR, IT, EN)

export type SupportedLanguage = 'de' | 'fr' | 'it' | 'en';

export interface TranslationKey {
  [key: string]: string | TranslationKey;
}

// Swiss market translations
export const translations: Record<SupportedLanguage, TranslationKey> = {
  de: {
    // Navigation
    nav: {
      dashboard: 'Dashboard',
      customers: 'Kunden',
      vehicles: 'Fahrzeuge',
      comparison: 'Vergleich',
      tco: 'TCO-Rechner',
      reports: 'Berichte',
      notifications: 'Benachrichtigungen',
      settings: 'Einstellungen',
      profile: 'Profil',
      logout: 'Abmelden'
    },
    
    // Common terms
    common: {
      save: 'Speichern',
      cancel: 'Abbrechen',
      delete: 'Löschen',
      edit: 'Bearbeiten',
      view: 'Anzeigen',
      create: 'Erstellen',
      update: 'Aktualisieren',
      search: 'Suchen',
      filter: 'Filtern',
      sort: 'Sortieren',
      export: 'Exportieren',
      import: 'Importieren',
      download: 'Herunterladen',
      upload: 'Hochladen',
      loading: 'Laden...',
      error: 'Fehler',
      success: 'Erfolgreich',
      warning: 'Warnung',
      info: 'Information',
      yes: 'Ja',
      no: 'Nein',
      ok: 'OK',
      close: 'Schließen',
      next: 'Weiter',
      previous: 'Zurück',
      finish: 'Fertig',
      select: 'Auswählen',
      none: 'Keine',
      all: 'Alle',
      total: 'Gesamt',
      date: 'Datum',
      time: 'Zeit',
      name: 'Name',
      email: 'E-Mail',
      phone: 'Telefon',
      address: 'Adresse',
      city: 'Stadt',
      postalCode: 'PLZ',
      canton: 'Kanton',
      country: 'Land',
      language: 'Sprache',
      status: 'Status',
      priority: 'Priorität',
      type: 'Typ',
      category: 'Kategorie',
      description: 'Beschreibung',
      notes: 'Notizen',
      amount: 'Betrag',
      price: 'Preis',
      currency: 'Währung',
      percentage: 'Prozent'
    },

    // Customer management
    customers: {
      title: 'Kundenverwaltung',
      subtitle: 'Schweizer CADILLAC EV Kunden',
      newCustomer: 'Neuer Kunde',
      editCustomer: 'Kunde bearbeiten',
      deleteCustomer: 'Kunde löschen',
      customerDetails: 'Kundendetails',
      personalInfo: 'Persönliche Daten',
      contactInfo: 'Kontaktdaten',
      preferences: 'Präferenzen',
      vehicleInterest: 'Fahrzeuginteresse',
      leadSource: 'Lead-Quelle',
      assignedSalesperson: 'Zugewiesener Verkäufer',
      registrationDate: 'Registrierungsdatum',
      lastContact: 'Letzter Kontakt',
      nextFollowUp: 'Nächste Nachfassung',
      dsgvoConsent: 'DSGVO-Zustimmung',
      marketingConsent: 'Marketing-Zustimmung',
      estimatedBudget: 'Geschätztes Budget',
      currentVehicle: 'Aktuelles Fahrzeug',
      evExperience: 'E-Fahrzeug Erfahrung',
      homeCharging: 'Laden zu Hause möglich',
      preferredContact: 'Bevorzugter Kontakt',
      contactTime: 'Kontaktzeit',
      importCustomers: 'Kunden importieren',
      exportCustomers: 'Kunden exportieren',
      statusLead: 'Lead',
      statusProspect: 'Interessent',
      statusCustomer: 'Kunde',
      statusInactive: 'Inaktiv'
    },

    // Vehicle comparison
    vehicles: {
      title: 'Fahrzeugvergleich',
      subtitle: 'LYRIQ vs VISTIQ für den Schweizer Markt',
      comparison: 'Vergleich',
      specifications: 'Spezifikationen',
      performance: 'Leistung',
      range: 'Reichweite',
      acceleration: 'Beschleunigung',
      topSpeed: 'Höchstgeschwindigkeit',
      power: 'Leistung',
      torque: 'Drehmoment',
      battery: 'Batterie',
      charging: 'Laden',
      chargingTime: 'Ladezeit',
      fastCharging: 'Schnellladen',
      homeCharging: 'Laden zu Hause',
      dimensions: 'Abmessungen',
      length: 'Länge',
      width: 'Breite',
      height: 'Höhe',
      wheelbase: 'Radstand',
      weight: 'Gewicht',
      trunk: 'Kofferraum',
      features: 'Ausstattung',
      luxury: 'Luxus',
      technology: 'Technologie',
      safety: 'Sicherheit',
      swissFeatures: 'Schweizer Features',
      pricing: 'Preise',
      basePrice: 'Grundpreis',
      afterIncentives: 'Nach Förderung',
      cantonalIncentive: 'Kantonale Förderung',
      availability: 'Verfügbarkeit',
      serviceLocations: 'Service-Standorte',
      winterPerformance: 'Winterleistung',
      bookTestDrive: 'Probefahrt buchen',
      requestQuote: 'Angebot anfragen',
      downloadBrochure: 'Broschüre herunterladen'
    },

    // TCO Calculator
    tco: {
      title: 'TCO-Rechner',
      subtitle: 'Total Cost of Ownership für Schweizer Markt',
      calculator: 'Rechner',
      results: 'Ergebnisse',
      comparison: 'Vergleich',
      vehicleSelection: 'Fahrzeugwahl',
      personalInfo: 'Persönliche Angaben',
      drivingProfile: 'Fahrprofil',
      financingOptions: 'Finanzierungsoptionen',
      incentives: 'Förderungen',
      totalCost: 'Gesamtkosten',
      monthlyCost: 'Monatliche Kosten',
      annualCost: 'Jährliche Kosten',
      fiveYearCost: 'Kosten über 5 Jahre',
      purchasePrice: 'Anschaffungspreis',
      insurance: 'Versicherung',
      maintenance: 'Wartung',
      energy: 'Energie',
      taxes: 'Steuern',
      depreciation: 'Wertverlust',
      financing: 'Finanzierung',
      leasing: 'Leasing',
      cashPurchase: 'Barkauf',
      annualMileage: 'Jährliche Fahrleistung',
      electricityPrice: 'Strompreis',
      homeChargingPercentage: 'Laden zu Hause (%)',
      publicChargingCost: 'Öffentliche Ladekosten',
      calculate: 'Berechnen',
      recalculate: 'Neu berechnen',
      saveCalculation: 'Berechnung speichern',
      loadCalculation: 'Berechnung laden',
      shareCalculation: 'Berechnung teilen',
      printReport: 'Bericht drucken'
    },

    // Reporting
    reports: {
      title: 'Berichte',
      subtitle: 'Verkaufsstatistiken und Analytics',
      dashboard: 'Dashboard',
      analytics: 'Analytics',
      templates: 'Vorlagen',
      overview: 'Übersicht',
      salesMetrics: 'Verkaufskennzahlen',
      customerMetrics: 'Kundenkennzahlen',
      vehiclePerformance: 'Fahrzeug-Performance',
      cantonAnalysis: 'Kantons-Analyse',
      timeframe: 'Zeitraum',
      period: 'Periode',
      daily: 'Täglich',
      weekly: 'Wöchentlich',
      monthly: 'Monatlich',
      quarterly: 'Quartalsweise',
      yearly: 'Jährlich',
      totalLeads: 'Gesamte Leads',
      totalProspects: 'Gesamte Interessenten',
      totalCustomers: 'Gesamte Kunden',
      totalSales: 'Gesamte Verkäufe',
      totalRevenue: 'Gesamtumsatz',
      conversionRate: 'Conversion-Rate',
      averageOrderValue: 'Durchschnittlicher Bestellwert',
      topCantons: 'Top Kantone',
      topVehicles: 'Top Fahrzeuge',
      salesTrend: 'Verkaufstrend',
      generateReport: 'Bericht erstellen',
      scheduleReport: 'Bericht planen',
      exportReport: 'Bericht exportieren',
      emailReport: 'Bericht per E-Mail',
      reportTemplate: 'Berichtsvorlage',
      customReport: 'Benutzerdefinierter Bericht'
    },

    // Notifications
    notifications: {
      title: 'Benachrichtigungen',
      subtitle: 'Notification Center',
      all: 'Alle',
      unread: 'Ungelesen',
      important: 'Wichtig',
      failed: 'Fehlgeschlagen',
      markAsRead: 'Als gelesen markieren',
      markAsUnread: 'Als ungelesen markieren',
      delete: 'Löschen',
      viewDetails: 'Details anzeigen',
      newCustomer: 'Neuer Kunde',
      newLead: 'Neuer Lead',
      testDriveRequested: 'Probefahrt angefragt',
      saleCompleted: 'Verkauf abgeschlossen',
      tcoCalculationCompleted: 'TCO-Berechnung abgeschlossen',
      dsgvoConsentRequired: 'DSGVO-Zustimmung erforderlich',
      serviceReminder: 'Service-Erinnerung',
      systemMaintenance: 'Systemwartung',
      priorityLow: 'Niedrig',
      priorityNormal: 'Normal',
      priorityHigh: 'Hoch',
      priorityUrgent: 'Dringend',
      statusPending: 'Ausstehend',
      statusSent: 'Gesendet',
      statusDelivered: 'Zugestellt',
      statusRead: 'Gelesen',
      statusFailed: 'Fehlgeschlagen'
    },

    // DSGVO & Compliance
    dsgvo: {
      title: 'DSGVO & Datenschutz',
      compliance: 'Compliance',
      consentRequired: 'Zustimmung erforderlich',
      consentObtained: 'Zustimmung erhalten',
      dataProcessing: 'Datenverarbeitung',
      dataRetention: 'Datenspeicherung',
      dataExport: 'Datenexport',
      dataDeletion: 'Datenlöschung',
      privacyPolicy: 'Datenschutzerklärung',
      cookiePolicy: 'Cookie-Richtlinie',
      marketingConsent: 'Marketing-Zustimmung',
      functionalCookies: 'Funktionale Cookies',
      analyticsCookies: 'Analytics-Cookies',
      marketingCookies: 'Marketing-Cookies',
      acceptAll: 'Alle akzeptieren',
      rejectAll: 'Alle ablehnen',
      customize: 'Anpassen',
      yourRights: 'Ihre Rechte',
      rightToAccess: 'Recht auf Auskunft',
      rightToRectification: 'Recht auf Berichtigung',
      rightToErasure: 'Recht auf Löschung',
      rightToPortability: 'Recht auf Datenübertragbarkeit',
      rightToObject: 'Widerspruchsrecht',
      contactDpo: 'Datenschutzbeauftragten kontaktieren'
    },

    // Swiss market specific
    swiss: {
      cantons: 'Kantone',
      allCantons: 'Alle Kantone',
      germanSpeaking: 'Deutschsprachige Schweiz',
      frenchSpeaking: 'Französischsprachige Schweiz',
      italianSpeaking: 'Italienischsprachige Schweiz',
      languages: 'Landessprachen',
      swissGerman: 'Schweizerdeutsch',
      french: 'Französisch',
      italian: 'Italienisch',
      romansh: 'Rätoromanisch',
      currency: 'Schweizer Franken',
      postalCode: 'Postleitzahl',
      municipality: 'Gemeinde',
      district: 'Bezirk',
      region: 'Region',
      evIncentives: 'E-Fahrzeug Förderungen',
      cantonalIncentive: 'Kantonale Förderung',
      municipalIncentive: 'Gemeinde-Förderung',
      taxExemption: 'Steuerbefreiung',
      reducedRegistration: 'Reduzierte Zulassungsgebühr',
      parkingBenefits: 'Parkvorteile',
      accessToLanes: 'Zugang zu Busspuren',
      chargingInfrastructure: 'Ladeinfrastruktur',
      swissQuality: 'Schweizer Qualität',
      madeinSwitzerland: 'Made in Switzerland',
      swissCompliance: 'Schweizer Compliance',
      swissStandards: 'Schweizer Standards'
    },

    // Error messages
    errors: {
      required: 'Dieses Feld ist erforderlich',
      invalidEmail: 'Ungültige E-Mail-Adresse',
      invalidPhone: 'Ungültige Telefonnummer',
      invalidPostalCode: 'Ungültige Postleitzahl',
      invalidDate: 'Ungültiges Datum',
      minLength: 'Mindestens {min} Zeichen erforderlich',
      maxLength: 'Maximal {max} Zeichen erlaubt',
      networkError: 'Netzwerkfehler. Bitte versuchen Sie es erneut.',
      serverError: 'Serverfehler. Bitte kontaktieren Sie den Support.',
      notFound: 'Ressource nicht gefunden',
      unauthorized: 'Nicht autorisiert',
      forbidden: 'Zugriff verweigert',
      validationError: 'Validierungsfehler'
    },

    // Success messages
    success: {
      saved: 'Erfolgreich gespeichert',
      updated: 'Erfolgreich aktualisiert',
      deleted: 'Erfolgreich gelöscht',
      created: 'Erfolgreich erstellt',
      imported: 'Erfolgreich importiert',
      exported: 'Erfolgreich exportiert',
      sent: 'Erfolgreich gesendet',
      uploaded: 'Erfolgreich hochgeladen',
      downloaded: 'Erfolgreich heruntergeladen'
    }
  },

  fr: {
    // Navigation
    nav: {
      dashboard: 'Tableau de bord',
      customers: 'Clients',
      vehicles: 'Véhicules',
      comparison: 'Comparaison',
      tco: 'Calculateur TCO',
      reports: 'Rapports',
      notifications: 'Notifications',
      settings: 'Paramètres',
      profile: 'Profil',
      logout: 'Déconnexion'
    },

    // Common terms
    common: {
      save: 'Enregistrer',
      cancel: 'Annuler',
      delete: 'Supprimer',
      edit: 'Modifier',
      view: 'Voir',
      create: 'Créer',
      update: 'Mettre à jour',
      search: 'Rechercher',
      filter: 'Filtrer',
      sort: 'Trier',
      export: 'Exporter',
      import: 'Importer',
      download: 'Télécharger',
      upload: 'Téléverser',
      loading: 'Chargement...',
      error: 'Erreur',
      success: 'Succès',
      warning: 'Avertissement',
      info: 'Information',
      yes: 'Oui',
      no: 'Non',
      ok: 'OK',
      close: 'Fermer',
      next: 'Suivant',
      previous: 'Précédent',
      finish: 'Terminer',
      select: 'Sélectionner',
      none: 'Aucun',
      all: 'Tous',
      total: 'Total',
      date: 'Date',
      time: 'Heure',
      name: 'Nom',
      email: 'E-mail',
      phone: 'Téléphone',
      address: 'Adresse',
      city: 'Ville',
      postalCode: 'NPA',
      canton: 'Canton',
      country: 'Pays',
      language: 'Langue',
      status: 'Statut',
      priority: 'Priorité',
      type: 'Type',
      category: 'Catégorie',
      description: 'Description',
      notes: 'Notes',
      amount: 'Montant',
      price: 'Prix',
      currency: 'Devise',
      percentage: 'Pourcentage'
    },

    // Customer management
    customers: {
      title: 'Gestion des clients',
      subtitle: 'Clients CADILLAC EV suisses',
      newCustomer: 'Nouveau client',
      editCustomer: 'Modifier le client',
      deleteCustomer: 'Supprimer le client',
      customerDetails: 'Détails du client',
      personalInfo: 'Informations personnelles',
      contactInfo: 'Informations de contact',
      preferences: 'Préférences',
      vehicleInterest: 'Intérêt véhicule',
      leadSource: 'Source du lead',
      assignedSalesperson: 'Vendeur assigné',
      registrationDate: 'Date d\'inscription',
      lastContact: 'Dernier contact',
      nextFollowUp: 'Prochain suivi',
      dsgvoConsent: 'Consentement RGPD',
      marketingConsent: 'Consentement marketing',
      estimatedBudget: 'Budget estimé',
      currentVehicle: 'Véhicule actuel',
      evExperience: 'Expérience VE',
      homeCharging: 'Recharge à domicile possible',
      preferredContact: 'Contact préféré',
      contactTime: 'Heure de contact',
      importCustomers: 'Importer clients',
      exportCustomers: 'Exporter clients',
      statusLead: 'Lead',
      statusProspect: 'Prospect',
      statusCustomer: 'Client',
      statusInactive: 'Inactif'
    },

    // Vehicle comparison  
    vehicles: {
      title: 'Comparaison de véhicules',
      subtitle: 'LYRIQ vs VISTIQ pour le marché suisse',
      comparison: 'Comparaison',
      specifications: 'Spécifications',
      performance: 'Performance',
      range: 'Autonomie',
      acceleration: 'Accélération',
      topSpeed: 'Vitesse maximale',
      power: 'Puissance',
      torque: 'Couple',
      battery: 'Batterie',
      charging: 'Recharge',
      chargingTime: 'Temps de recharge',
      fastCharging: 'Recharge rapide',
      homeCharging: 'Recharge à domicile',
      dimensions: 'Dimensions',
      length: 'Longueur',
      width: 'Largeur',
      height: 'Hauteur',
      wheelbase: 'Empattement',
      weight: 'Poids',
      trunk: 'Coffre',
      features: 'Équipements',
      luxury: 'Luxe',
      technology: 'Technologie',
      safety: 'Sécurité',
      swissFeatures: 'Fonctionnalités suisses',
      pricing: 'Prix',
      basePrice: 'Prix de base',
      afterIncentives: 'Après incitations',
      cantonalIncentive: 'Incitation cantonale',
      availability: 'Disponibilité',
      serviceLocations: 'Centres de service',
      winterPerformance: 'Performance hivernale',
      bookTestDrive: 'Réserver un essai',
      requestQuote: 'Demander un devis',
      downloadBrochure: 'Télécharger la brochure'
    },

    // TCO Calculator
    tco: {
      title: 'Calculateur TCO',
      subtitle: 'Coût total de possession pour le marché suisse',
      calculator: 'Calculateur',
      results: 'Résultats',
      comparison: 'Comparaison',
      vehicleSelection: 'Sélection du véhicule',
      personalInfo: 'Informations personnelles',
      drivingProfile: 'Profil de conduite',
      financingOptions: 'Options de financement',
      incentives: 'Incitations',
      totalCost: 'Coût total',
      monthlyCost: 'Coût mensuel',
      annualCost: 'Coût annuel',
      fiveYearCost: 'Coût sur 5 ans',
      purchasePrice: 'Prix d\'achat',
      insurance: 'Assurance',
      maintenance: 'Entretien',
      energy: 'Énergie',
      taxes: 'Taxes',
      depreciation: 'Dépréciation',
      financing: 'Financement',
      leasing: 'Leasing',
      cashPurchase: 'Achat comptant',
      annualMileage: 'Kilométrage annuel',
      electricityPrice: 'Prix de l\'électricité',
      homeChargingPercentage: 'Recharge à domicile (%)',
      publicChargingCost: 'Coût recharge publique',
      calculate: 'Calculer',
      recalculate: 'Recalculer',
      saveCalculation: 'Enregistrer calcul',
      loadCalculation: 'Charger calcul',
      shareCalculation: 'Partager calcul',
      printReport: 'Imprimer rapport'
    },

    // Swiss market specific
    swiss: {
      cantons: 'Cantons',
      allCantons: 'Tous les cantons',
      germanSpeaking: 'Suisse alémanique',
      frenchSpeaking: 'Suisse romande',
      italianSpeaking: 'Suisse italienne',
      languages: 'Langues nationales',
      swissGerman: 'Allemand suisse',
      french: 'Français',
      italian: 'Italien',
      romansh: 'Romanche',
      currency: 'Franc suisse',
      postalCode: 'Code postal',
      municipality: 'Commune',
      district: 'District',
      region: 'Région',
      evIncentives: 'Incitations VE',
      cantonalIncentive: 'Incitation cantonale',
      municipalIncentive: 'Incitation communale',
      taxExemption: 'Exemption fiscale',
      reducedRegistration: 'Immatriculation réduite',
      parkingBenefits: 'Avantages parking',
      accessToLanes: 'Accès voies bus',
      chargingInfrastructure: 'Infrastructure de recharge',
      swissQuality: 'Qualité suisse',
      madeinSwitzerland: 'Made in Switzerland',
      swissCompliance: 'Conformité suisse',
      swissStandards: 'Standards suisses'
    }
  },

  it: {
    // Navigation
    nav: {
      dashboard: 'Dashboard',
      customers: 'Clienti',
      vehicles: 'Veicoli',
      comparison: 'Confronto',
      tco: 'Calcolatore TCO',
      reports: 'Rapporti',
      notifications: 'Notifiche',
      settings: 'Impostazioni',
      profile: 'Profilo',
      logout: 'Disconnetti'
    },

    // Common terms
    common: {
      save: 'Salva',
      cancel: 'Annulla',
      delete: 'Elimina',
      edit: 'Modifica',
      view: 'Visualizza',
      create: 'Crea',
      update: 'Aggiorna',
      search: 'Cerca',
      filter: 'Filtra',
      sort: 'Ordina',
      export: 'Esporta',
      import: 'Importa',
      download: 'Scarica',
      upload: 'Carica',
      loading: 'Caricamento...',
      error: 'Errore',
      success: 'Successo',
      warning: 'Avviso',
      info: 'Informazione',
      yes: 'Sì',
      no: 'No',
      ok: 'OK',
      close: 'Chiudi',
      next: 'Avanti',
      previous: 'Indietro',
      finish: 'Fine',
      select: 'Seleziona',
      none: 'Nessuno',
      all: 'Tutti',
      total: 'Totale',
      date: 'Data',
      time: 'Ora',
      name: 'Nome',
      email: 'E-mail',
      phone: 'Telefono',
      address: 'Indirizzo',
      city: 'Città',
      postalCode: 'CAP',
      canton: 'Cantone',
      country: 'Paese',
      language: 'Lingua',
      status: 'Stato',
      priority: 'Priorità',
      type: 'Tipo',
      category: 'Categoria',
      description: 'Descrizione',
      notes: 'Note',
      amount: 'Importo',
      price: 'Prezzo',
      currency: 'Valuta',
      percentage: 'Percentuale'
    },

    // Customer management
    customers: {
      title: 'Gestione clienti',
      subtitle: 'Clienti CADILLAC EV svizzeri',
      newCustomer: 'Nuovo cliente',
      editCustomer: 'Modifica cliente',
      deleteCustomer: 'Elimina cliente',
      customerDetails: 'Dettagli cliente',
      personalInfo: 'Informazioni personali',
      contactInfo: 'Informazioni di contatto',
      preferences: 'Preferenze',
      vehicleInterest: 'Interesse veicolo',
      leadSource: 'Fonte lead',
      assignedSalesperson: 'Venditore assegnato',
      registrationDate: 'Data registrazione',
      lastContact: 'Ultimo contatto',
      nextFollowUp: 'Prossimo follow-up',
      dsgvoConsent: 'Consenso GDPR',
      marketingConsent: 'Consenso marketing',
      estimatedBudget: 'Budget stimato',
      currentVehicle: 'Veicolo attuale',
      evExperience: 'Esperienza VE',
      homeCharging: 'Ricarica a casa possibile',
      preferredContact: 'Contatto preferito',
      contactTime: 'Orario contatto',
      importCustomers: 'Importa clienti',
      exportCustomers: 'Esporta clienti',
      statusLead: 'Lead',
      statusProspect: 'Prospect',
      statusCustomer: 'Cliente',
      statusInactive: 'Inattivo'
    },

    // Swiss market specific
    swiss: {
      cantons: 'Cantoni',
      allCantons: 'Tutti i cantoni',
      germanSpeaking: 'Svizzera tedesca',
      frenchSpeaking: 'Svizzera francese',
      italianSpeaking: 'Svizzera italiana',
      languages: 'Lingue nazionali',
      swissGerman: 'Tedesco svizzero',
      french: 'Francese',
      italian: 'Italiano',
      romansh: 'Romancio',
      currency: 'Franco svizzero',
      postalCode: 'Codice postale',
      municipality: 'Comune',
      district: 'Distretto',
      region: 'Regione',
      evIncentives: 'Incentivi VE',
      cantonalIncentive: 'Incentivo cantonale',
      municipalIncentive: 'Incentivo comunale',
      taxExemption: 'Esenzione fiscale',
      reducedRegistration: 'Immatricolazione ridotta',
      parkingBenefits: 'Vantaggi parcheggio',
      accessToLanes: 'Accesso corsie bus',
      chargingInfrastructure: 'Infrastruttura ricarica',
      swissQuality: 'Qualità svizzera',
      madeinSwitzerland: 'Made in Switzerland',
      swissCompliance: 'Conformità svizzera',
      swissStandards: 'Standard svizzeri'
    }
  },

  en: {
    // Navigation
    nav: {
      dashboard: 'Dashboard',
      customers: 'Customers',
      vehicles: 'Vehicles',
      comparison: 'Comparison',
      tco: 'TCO Calculator',
      reports: 'Reports',
      notifications: 'Notifications',
      settings: 'Settings',
      profile: 'Profile',
      logout: 'Logout'
    },

    // Common terms
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      view: 'View',
      create: 'Create',
      update: 'Update',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      export: 'Export',
      import: 'Import',
      download: 'Download',
      upload: 'Upload',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      warning: 'Warning',
      info: 'Information',
      yes: 'Yes',
      no: 'No',
      ok: 'OK',
      close: 'Close',
      next: 'Next',
      previous: 'Previous',
      finish: 'Finish',
      select: 'Select',
      none: 'None',
      all: 'All',
      total: 'Total',
      date: 'Date',
      time: 'Time',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      address: 'Address',
      city: 'City',
      postalCode: 'Postal Code',
      canton: 'Canton',
      country: 'Country',
      language: 'Language',
      status: 'Status',
      priority: 'Priority',
      type: 'Type',
      category: 'Category',
      description: 'Description',
      notes: 'Notes',
      amount: 'Amount',
      price: 'Price',
      currency: 'Currency',
      percentage: 'Percentage'
    },

    // Swiss market specific
    swiss: {
      cantons: 'Cantons',
      allCantons: 'All cantons',
      germanSpeaking: 'German-speaking Switzerland',
      frenchSpeaking: 'French-speaking Switzerland',
      italianSpeaking: 'Italian-speaking Switzerland',
      languages: 'National languages',
      swissGerman: 'Swiss German',
      french: 'French',
      italian: 'Italian',
      romansh: 'Romansh',
      currency: 'Swiss Franc',
      postalCode: 'Postal code',
      municipality: 'Municipality',
      district: 'District',
      region: 'Region',
      evIncentives: 'EV incentives',
      cantonalIncentive: 'Cantonal incentive',
      municipalIncentive: 'Municipal incentive',
      taxExemption: 'Tax exemption',
      reducedRegistration: 'Reduced registration',
      parkingBenefits: 'Parking benefits',
      accessToLanes: 'Access to bus lanes',
      chargingInfrastructure: 'Charging infrastructure',
      swissQuality: 'Swiss quality',
      madeinSwitzerland: 'Made in Switzerland',
      swissCompliance: 'Swiss compliance',
      swissStandards: 'Swiss standards'
    }
  }
};

// Translation helper functions
export class I18nService {
  private currentLanguage: SupportedLanguage = 'de';

  setLanguage(language: SupportedLanguage) {
    this.currentLanguage = language;
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferred_language', language);
      document.documentElement.lang = language;
    }
  }

  getLanguage(): SupportedLanguage {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('preferred_language') as SupportedLanguage;
      if (stored && ['de', 'fr', 'it', 'en'].includes(stored)) {
        return stored;
      }
    }
    return this.currentLanguage;
  }

  t(key: string, params?: { [key: string]: string | number }): string {
    const keys = key.split('.');
    let value: any = translations[this.getLanguage()];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to German if key not found
        value = translations.de;
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object' && fallbackKey in value) {
            value = value[fallbackKey];
          } else {
            return key; // Return key if not found
          }
        }
        break;
      }
    }

    if (typeof value !== 'string') {
      return key;
    }

    // Replace parameters
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        value = value.replace(`{${paramKey}}`, String(paramValue));
      });
    }

    return value;
  }

  getLanguageOptions() {
    return [
      { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
      { code: 'fr', name: 'Français', flag: '🇫🇷' },
      { code: 'it', name: 'Italiano', flag: '🇮🇹' },
      { code: 'en', name: 'English', flag: '🇬🇧' }
    ];
  }

  formatCurrency(amount: number, language?: SupportedLanguage): string {
    const lang = language || this.getLanguage();
    
    const locales = {
      de: 'de-CH',
      fr: 'fr-CH',
      it: 'it-CH',
      en: 'en-CH'
    };

    return new Intl.NumberFormat(locales[lang], {
      style: 'currency',
      currency: 'CHF'
    }).format(amount);
  }

  formatDate(date: Date, language?: SupportedLanguage): string {
    const lang = language || this.getLanguage();
    
    const locales = {
      de: 'de-CH',
      fr: 'fr-CH',
      it: 'it-CH',
      en: 'en-CH'
    };

    return new Intl.DateTimeFormat(locales[lang]).format(date);
  }

  formatNumber(number: number, language?: SupportedLanguage): string {
    const lang = language || this.getLanguage();
    
    const locales = {
      de: 'de-CH',
      fr: 'fr-CH',
      it: 'it-CH',
      en: 'en-CH'
    };

    return new Intl.NumberFormat(locales[lang]).format(number);
  }

  // Swiss canton specific translations
  getCantonName(cantonCode: string, language?: SupportedLanguage): string {
    const lang = language || this.getLanguage();
    
    const cantonNames = {
      de: {
        'ZH': 'Zürich', 'BE': 'Bern', 'LU': 'Luzern', 'UR': 'Uri',
        'SZ': 'Schwyz', 'OW': 'Obwalden', 'NW': 'Nidwalden', 'GL': 'Glarus',
        'ZG': 'Zug', 'FR': 'Freiburg', 'SO': 'Solothurn', 'BS': 'Basel-Stadt',
        'BL': 'Basel-Landschaft', 'SH': 'Schaffhausen', 'AR': 'Appenzell Ausserrhoden',
        'AI': 'Appenzell Innerrhoden', 'SG': 'St. Gallen', 'GR': 'Graubünden',
        'AG': 'Aargau', 'TG': 'Thurgau', 'TI': 'Tessin', 'VD': 'Waadt',
        'VS': 'Wallis', 'NE': 'Neuenburg', 'GE': 'Genf', 'JU': 'Jura'
      },
      fr: {
        'ZH': 'Zurich', 'BE': 'Berne', 'LU': 'Lucerne', 'UR': 'Uri',
        'SZ': 'Schwyz', 'OW': 'Obwald', 'NW': 'Nidwald', 'GL': 'Glaris',
        'ZG': 'Zoug', 'FR': 'Fribourg', 'SO': 'Soleure', 'BS': 'Bâle-Ville',
        'BL': 'Bâle-Campagne', 'SH': 'Schaffhouse', 'AR': 'Appenzell Rhodes-Extérieures',
        'AI': 'Appenzell Rhodes-Intérieures', 'SG': 'Saint-Gall', 'GR': 'Grisons',
        'AG': 'Argovie', 'TG': 'Thurgovie', 'TI': 'Tessin', 'VD': 'Vaud',
        'VS': 'Valais', 'NE': 'Neuchâtel', 'GE': 'Genève', 'JU': 'Jura'
      },
      it: {
        'ZH': 'Zurigo', 'BE': 'Berna', 'LU': 'Lucerna', 'UR': 'Uri',
        'SZ': 'Svitto', 'OW': 'Obvaldo', 'NW': 'Nidvaldo', 'GL': 'Glarona',
        'ZG': 'Zugo', 'FR': 'Friburgo', 'SO': 'Soletta', 'BS': 'Basilea Città',
        'BL': 'Basilea Campagna', 'SH': 'Sciaffusa', 'AR': 'Appenzello Esterno',
        'AI': 'Appenzello Interno', 'SG': 'San Gallo', 'GR': 'Grigioni',
        'AG': 'Argovia', 'TG': 'Turgovia', 'TI': 'Ticino', 'VD': 'Vaud',
        'VS': 'Vallese', 'NE': 'Neuchâtel', 'GE': 'Ginevra', 'JU': 'Giura'
      },
      en: {
        'ZH': 'Zurich', 'BE': 'Bern', 'LU': 'Lucerne', 'UR': 'Uri',
        'SZ': 'Schwyz', 'OW': 'Obwalden', 'NW': 'Nidwalden', 'GL': 'Glarus',
        'ZG': 'Zug', 'FR': 'Fribourg', 'SO': 'Solothurn', 'BS': 'Basel-Stadt',
        'BL': 'Basel-Landschaft', 'SH': 'Schaffhausen', 'AR': 'Appenzell Ausserrhoden',
        'AI': 'Appenzell Innerrhoden', 'SG': 'St. Gallen', 'GR': 'Graubünden',
        'AG': 'Aargau', 'TG': 'Thurgau', 'TI': 'Ticino', 'VD': 'Vaud',
        'VS': 'Valais', 'NE': 'Neuchâtel', 'GE': 'Geneva', 'JU': 'Jura'
      }
    };

    return cantonNames[lang]?.[cantonCode] || cantonCode;
  }
}

// Export singleton instance
export const i18n = new I18nService();

// React hook for internationalization
import { useState, useEffect } from 'react';

export function useTranslation() {
  const [language, setLanguage] = useState<SupportedLanguage>(i18n.getLanguage());

  useEffect(() => {
    const handleLanguageChange = () => {
      setLanguage(i18n.getLanguage());
    };

    // Listen for language changes
    window.addEventListener('languagechange', handleLanguageChange);
    
    return () => {
      window.removeEventListener('languagechange', handleLanguageChange);
    };
  }, []);

  const changeLanguage = (newLanguage: SupportedLanguage) => {
    i18n.setLanguage(newLanguage);
    setLanguage(newLanguage);
    
    // Dispatch custom event for components to listen
    window.dispatchEvent(new CustomEvent('languagechange'));
  };

  return {
    language,
    setLanguage: changeLanguage,
    t: i18n.t.bind(i18n),
    formatCurrency: i18n.formatCurrency.bind(i18n),
    formatDate: i18n.formatDate.bind(i18n),
    formatNumber: i18n.formatNumber.bind(i18n),
    getCantonName: i18n.getCantonName.bind(i18n),
    getLanguageOptions: i18n.getLanguageOptions.bind(i18n)
  };
}