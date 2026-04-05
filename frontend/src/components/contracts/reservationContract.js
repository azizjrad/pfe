const formatDate = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("fr-FR");
};

const formatDateTime = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatMoney = (value) => {
  const amount = Number(value || 0);
  return `${amount.toLocaleString("fr-FR")} DT`;
};

const getVehicleImage = (reservation) =>
  reservation?.vehicle_image ||
  reservation?.vehicle?.image ||
  reservation?.vehicle?.image_url ||
  reservation?.vehicle?.photo ||
  "";

export const buildReservationContractHtml = (reservation) => {
  const contractNumber = reservation?.contract_number || reservation?.id || "-";
  const startDate = formatDate(reservation?.start_date);
  const endDate = formatDate(reservation?.end_date);
  const pickupTime = formatDateTime(reservation?.start_date);
  const returnTime = formatDateTime(reservation?.end_date);
  const clientName =
    reservation?.client_name || reservation?.user?.name || "Client";
  const clientPhone =
    reservation?.client_phone || reservation?.user?.phone || "N/A";
  const agencyName = reservation?.agency_name || "Agence";
  const agencyPhone = reservation?.agency_phone || "N/A";
  const agencyAddress = reservation?.agency_address || "N/A";
  const vehicleName = reservation?.vehicle_name || "Véhicule";
  const vehicleCategory = reservation?.vehicle_category || "N/A";
  const vehiclePlate = reservation?.vehicle_plate || "N/A";
  const price = formatMoney(reservation?.total_price);
  const options = reservation?.options || "N/A";
  const vehicleImage = getVehicleImage(reservation);
  const durationDays =
    reservation?.start_date && reservation?.end_date
      ? Math.max(
          1,
          Math.ceil(
            (new Date(reservation.end_date) -
              new Date(reservation.start_date)) /
              (1000 * 60 * 60 * 24),
          ),
        )
      : "N/A";

  return `
    <!doctype html>
    <html lang="fr">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Contrat de location #${contractNumber}</title>
        <style>
          @page { size: A4; margin: 12mm; }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            font-family: Arial, Helvetica, sans-serif;
            color: #111827;
            background: #fff;
          }
          .page {
            width: 100%;
            min-height: calc(297mm - 24mm);
          }
          .header-bar {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 16px;
            border-bottom: 3px solid #111827;
            padding-bottom: 10px;
            margin-bottom: 12px;
          }
          .title {
            font-size: 17px;
            font-weight: 700;
            text-transform: uppercase;
            line-height: 1.35;
          }
          .subtitle { color: #4f46e5; font-weight: 700; }
          .brand-block {
            text-align: right;
            font-size: 11px;
            line-height: 1.5;
            color: #374151;
          }
          .brand-name {
            font-size: 13px;
            font-weight: 700;
            color: #111827;
          }
          .grid-3 {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            border: 2px solid #6b7280;
            margin-top: 10px;
          }
          .box {
            border-right: 2px solid #6b7280;
            min-height: 120px;
          }
          .box:last-child { border-right: 0; }
          .box-header {
            background: #d1d5db;
            border-bottom: 2px solid #6b7280;
            text-align: center;
            font-weight: 700;
            padding: 6px 8px;
          }
          .box-body {
            padding: 10px 12px;
            font-size: 12px;
            line-height: 1.7;
          }
          .vehicle-photo {
            width: 100%;
            height: 92px;
            object-fit: cover;
            border: 1px solid #d1d5db;
            margin-top: 8px;
          }
          .label-row span:first-child { font-weight: 700; }
          .section {
            margin-top: 18px;
            border: 2px solid #6b7280;
          }
          .section-header {
            background: #d1d5db;
            border-bottom: 2px solid #6b7280;
            text-align: center;
            font-weight: 700;
            padding: 6px 8px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
          }
          th, td {
            border: 2px solid #6b7280;
            padding: 6px 8px;
            vertical-align: top;
          }
          th {
            background: #e5e7eb;
            text-align: center;
            font-weight: 700;
          }
          .two-col {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }
          .mini-grid {
            display: grid;
            grid-template-columns: 1.2fr 1fr;
            border: 2px solid #6b7280;
          }
          .mini-grid .left { border-right: 2px solid #6b7280; }
          .mini-grid .left, .mini-grid .right {
            padding: 8px;
            min-height: 150px;
          }
          .placeholder {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
            min-height: 180px;
            border: 2px dashed #9ca3af;
            color: #6366f1;
            font-weight: 700;
            text-align: center;
            padding: 12px;
          }
          .signature-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            margin-top: 14px;
            border: 2px solid #6b7280;
          }
          .signature-grid > div {
            min-height: 95px;
            padding: 8px;
            border-right: 2px solid #6b7280;
          }
          .signature-grid > div:last-child { border-right: 0; }
          .footnote {
            margin-top: 10px;
            font-size: 11px;
            font-weight: 700;
          }
          .muted { color: #4b5563; }
          .small { font-size: 11px; }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="header-bar">
            <div class="title">
              Contrat de location, n°<span class="subtitle">${contractNumber}</span>, du <span class="subtitle">${startDate}</span> au <span class="subtitle">${endDate}</span>
            </div>
            <div class="brand-block">
              <div class="brand-name">${agencyName}</div>
              <div>${agencyPhone}</div>
              <div>${agencyAddress}</div>
            </div>
          </div>

          <div class="grid-3">
            <div class="box">
              <div class="box-header">LOCATAIRE</div>
              <div class="box-body">
                <div class="label-row"><span>Locataire :</span> ${clientName}</div>
                <div class="label-row"><span>Date de naissance :</span> ${reservation?.client_birth_date ? formatDate(reservation.client_birth_date) : "N/A"}</div>
                <div class="label-row"><span>Tél :</span> ${clientPhone}</div>
              </div>
            </div>
            <div class="box">
              <div class="box-header">VEHICULE</div>
              <div class="box-body">
                <div class="label-row"><span>Marque/Modèle :</span> ${vehicleName}</div>
                <div class="label-row"><span>Catégorie :</span> ${vehicleCategory}</div>
                <div class="label-row"><span>Immatriculation :</span> ${vehiclePlate}</div>
                <div class="label-row"><span>Montant de la franchise :</span> ${reservation?.deposit_amount ? formatMoney(reservation.deposit_amount) : "N/A"}</div>
                <div class="label-row"><span>Montant de la caution :</span> ${reservation?.deposit_amount ? formatMoney(reservation.deposit_amount) : "N/A"}</div>
                ${vehicleImage ? `<img class="vehicle-photo" src="${vehicleImage}" alt="Photo du véhicule" />` : `<div class="placeholder" style="min-height: 92px; margin-top: 8px;">Photo principale du véhicule</div>`}
              </div>
            </div>
            <div class="box">
              <div class="box-header">LOCATION</div>
              <div class="box-body">
                <div class="label-row"><span>Début :</span> ${startDate} à ${pickupTime.split(", ")[1] || "[heure]"} à ${reservation?.pickup_location || "[Lieu]"}</div>
                <div class="label-row"><span>Fin :</span> ${endDate} à ${returnTime.split(", ")[1] || "[heure]"} à ${reservation?.return_location || "[Lieu]"}</div>
                <div class="label-row"><span>Prix total :</span> ${price}</div>
                <div class="label-row"><span>Options :</span> ${options}</div>
                <div class="label-row"><span>Durée :</span> ${durationDays} jour(s)</div>
              </div>
            </div>
          </div>

          <div class="section" style="margin-top: 18px;">
            <div class="section-header">RÉSUMÉ</div>
            <table>
              <tbody>
                <tr>
                  <th style="width: 25%;">Agence</th>
                  <td>${agencyName}${agencyAddress !== "N/A" ? ` - ${agencyAddress}` : ""}</td>
                  <th style="width: 20%;">Durée</th>
                  <td>${durationDays} jour(s)</td>
                </tr>
                <tr>
                  <th>Client</th>
                  <td>${clientName}</td>
                  <th>Téléphone</th>
                  <td>${clientPhone}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="section" style="margin-top: 18px;">
            <div class="section-header">CONDUCTEURS</div>
            <table>
              <thead>
                <tr>
                  <th>Prénom</th>
                  <th>Nom</th>
                  <th>Date de naissance</th>
                  <th>N° de permis</th>
                  <th>Date d'obtention</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="height: 44px;">${reservation?.driver_first_name || ""}</td>
                  <td>${reservation?.driver_last_name || ""}</td>
                  <td>${reservation?.driver_birth_date ? formatDate(reservation.driver_birth_date) : ""}</td>
                  <td>${reservation?.driver_license_number || ""}</td>
                  <td>${reservation?.driver_license_date ? formatDate(reservation.driver_license_date) : ""}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="two-col" style="margin-top: 18px; align-items: start;">
            <div class="mini-grid">
              <div class="left">
                <div class="section-header" style="margin: -8px -8px 8px -8px;">DEPART</div>
                <div class="small muted"><strong>Kms compteur</strong></div>
                <div class="small muted"><strong>Carburant</strong></div>
                <div class="small muted" style="margin-top: 8px; font-weight: 700;">Commentaire :</div>
                <div style="min-height: 58px;"></div>
                <div class="signature-grid">
                  <div><strong>Le Client</strong></div>
                  <div><strong>Le loueur</strong></div>
                </div>
              </div>
              <div class="right">
                <div class="placeholder">Insérer des photos du véhicule au départ</div>
              </div>
            </div>

            <div class="mini-grid">
              <div class="left">
                <div class="section-header" style="margin: -8px -8px 8px -8px;">RETOUR</div>
                <div class="small muted"><strong>Kms compteur</strong></div>
                <div class="small muted"><strong>Carburant</strong></div>
                <div class="small muted" style="margin-top: 8px; font-weight: 700;">Commentaire :</div>
                <div style="min-height: 58px;"></div>
                <div class="signature-grid">
                  <div><strong>Le Client</strong></div>
                  <div><strong>Le loueur</strong></div>
                </div>
              </div>
              <div class="right">
                <div class="placeholder">Insérer des photos du véhicule au retour</div>
              </div>
            </div>
          </div>

          <div class="footnote">
            En signant le contrat de location, le client accepte les conditions générales de location fournies par le loueur professionnel.
          </div>
        </div>
      </body>
    </html>
  `;
};

export const openReservationContract = (reservation) => {
  const html = buildReservationContractHtml(reservation);
  const contractWindow = window.open(
    "",
    "_blank",
    "noopener,noreferrer,width=1200,height=900",
  );

  if (!contractWindow) return;

  contractWindow.document.open();
  contractWindow.document.write(html);
  contractWindow.document.close();
  contractWindow.focus();

  const triggerPrint = () => {
    setTimeout(() => {
      contractWindow.print();
    }, 250);
  };

  if (contractWindow.document.readyState === "complete") {
    triggerPrint();
    return;
  }

  contractWindow.onload = triggerPrint;
};
