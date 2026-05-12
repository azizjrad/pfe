import sys

with open('Chapitres/Chapitre3.tex', 'r', encoding='utf-8') as f:
    c3 = f.readlines()
with open('Chapitres/Chapitre4.tex', 'r', encoding='utf-8') as f:
    c4 = f.readlines()

new_c3 = []
new_c3.extend(c3[0:131])           # Intro to Internaute Intro
new_c3.extend(c3[170:224])         # S inscrire
new_c3.extend(c3[224:227])         # Utils Intro
new_c3.extend(c3[227:275])         # S auth
new_c3.extend(c3[317:482])         # Profil
new_c3.extend(c3[730:901])         # Agence Intro + Vitrine
new_c3.extend(c3[482:608])         # Admin Intro + Agence
# We skip (608:730) which is Gerer clients
new_c3.extend(c3[901:985])         # Conception global + Seq Intro + Internaute Intro
new_c3.extend(c3[994:1004])        # Seq S inscr (skip cons act 985:994)
new_c3.extend(c3[1004:1018])       # Seq Utils intro + S auth
new_c3.extend(c3[1027:1055])       # Seq Profil (skip chatbot 1018:1027)
new_c3.extend(c3[1055:1076])       # Seq Admin Intro + Agence (skip client seq 1076:1096)
new_c3.extend(c3[1096:])           # Rest of C3

new_c4 = []
new_c4.extend(c4[0:158])           # Intro through Analyse Intro
new_c4.append('\n%==========================================================\n')
new_c4.append(r'\section{Analyse des cas d''utilisation de l''acteur "Internaute"}' + '\n')
new_c4.extend(c3[131:170])         # Consulter act
new_c4.extend(c3[275:317])         # Chatbot
new_c4.extend(c4[209:325])         # Client
new_c4.extend(c4[325:432])         # Agence
new_c4.extend(c4[158:209])         # Utils (Voir score)
new_c4.extend(c4[432:540])         # Admin
new_c4.extend(c4[540:603])         # Diag Classes Part ...
new_c4.append('\n%==========================================================\n')
new_c4.append(r'\subsection{Diagrammes de séquence détaillés de l''acteur Internaute}' + '\n')
new_c4.extend(c3[985:994])         # Seq cons act
new_c4.extend(c3[1018:1027])       # Seq chatbot
new_c4.extend(c4[616:638])         # Client Seq
new_c4.extend(c4[638:660])         # Agence Seq
new_c4.extend(c4[603:616])         # Utils Seq
new_c4.extend(c4[660:683])         # Admin Seq
new_c4.extend(c4[683:])            # Rest of C4

with open('Chapitres/Chapitre3.tex', 'w', encoding='utf-8') as f:
    f.writelines(new_c3)

with open('Chapitres/Chapitre4.tex', 'w', encoding='utf-8') as f:
    f.writelines(new_c4)

print("Restructuration terminee !")
