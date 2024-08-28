
    PACIENTE {
        INT id PK
        VARCHAR BI
        VARCHAR nome
        INT idade
        VARCHAR contacto_telefonico 
        VARCHAR email
        TIMESTAMP data_de_registro
        TIMESTAMP data_ultima_visita
        INT id_genero FK
        INT id_status FK
        INT id_ultima_factura FK
        INT id_unidade_de_saude FK
    }

    GENERO {
        INT id PK
        VARCHAR descricao
    }

    STATUS {
        INT id PK
        VARCHAR descricao
    }

    UNIDADE_DE_SAUDE {
        INT id PK
        VARCHAR nome
        VARCHAR endereco
        VARCHAR contato_telefonico
        VARCHAR email
        VARCHAR rede_social
        VARCHAR website
        INT id_tipo_unidade_de_saude FK
    }

    EXAME {
        INT id PK
        VARCHAR nome
        TEXT descricao
        DECIMAL preco
        INT id_status FK
        INT id_unidade_de_saude FK
    }

    TECNICO_LABORATORIO {
        INT id PK
        VARCHAR nome
        VARCHAR cargo
        VARCHAR contacto_telefonico
        VARCHAR email
        TIMESTAMP data_de_registro
        INT id_status FK
        INT id_unidade_de_saude FK
    }

    AGENDAMENTO {
        INT id PK
        INT id_paciente FK
        INT id_exame FK
        INT id_unidade_de_saude FK
        DATE data_agendamento
        TIME hora_agendamento
        INT id_status FK
        INT id_tecnico_alocado FK
        DATE data_pagamento
        INT id_unidade_de_saude FK
    }

    AMOSTRA {
        INT id PK
        INT id_agendamento FK
        DATE data_coleta
        TIME hora_coleta
        INT id_tecnico_coletor FK
        INT id_status FK
        INT id_unidade_de_saude FK
    }

    RESULTADO {
        INT id PK
        INT id_agendamento FK
        DATE data_resultado
        TIME hora_resultado
        TEXT descricao_resultado
        INT id_status FK
        INT id_tecnico_responsavel FK
        INT id_unidade_de_saude FK
        
    }

    FACTURA {
        INT id PK
        INT id_paciente FK
        DATE data_emissao
        DECIMAL valor_total
        INT id_status FK
        INT id_unidade_de_saude FK
    }



    MATERIAL_ESTOQUE {
        INT id PK
        VARCHAR nome
        INT quantidade
        VARCHAR unidade_de_medida
        INT id_unidade_de_saude FK
    }

    UTILIZACAO_MATERIAL {
        INT id PK
        INT id_exame FK
        INT id_material_estoque FK
        INT quantidade_usada
        INT id_unidade_de_saude FK
    }

    PROTOCOLO_EXAME {
        INT id PK
        INT id_exame FK
        TEXT descricao
        BLOB arquivo
        INT id_unidade_de_saude FK
    }
