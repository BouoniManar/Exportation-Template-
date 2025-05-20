# D:\Page-User\alembic\env.py

from logging.config import fileConfig
from sqlalchemy import engine_from_config
from sqlalchemy import pool
from alembic import context

# --- VOS MODIFICATIONS CI-DESSOUS ---

# 1. S'assurer que Python peut trouver votre dossier "Backend"
import os
import sys
# Le script env.py est dans D:\Page-User\alembic\
# Nous voulons ajouter D:\Page-User\ à sys.path
# os.path.dirname(__file__)  -> D:\Page-User\alembic
# os.path.join(..., '..')    -> D:\Page-User
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

# 2. Importer VOTRE Base et VOS modèles
# Ces imports sont maintenant relatifs à PROJECT_ROOT (D:\Page-User)
from Backend.app.base import Base  # Importe la variable 'Base' de votre fichier base.py
from Backend.app.models import models # Importe le module models.py.
                               # Ceci est crucial pour que Base.metadata connaisse toutes vos tables.
                                   # Assurez-vous que models.py définit User, Project, etc., et qu'ils héritent de votre 'Base'.

# --- FIN DE VOS MODIFICATIONS ---

# This is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
# from myapp import mymodel
# target_metadata = mymodel.Base.metadata
# --- MODIFIER LA LIGNE SUIVANTE ---
target_metadata = Base.metadata  # Dites à Alembic d'utiliser les métadonnées de VOTRE 'Base' importée ci-dessus

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = config.get_main_option("sqlalchemy.url") # Lit depuis alembic.ini
    context.configure(
        url=url,
        target_metadata=target_metadata, # Utilise VOTRE target_metadata
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        # compare_type=True, # Peut être utile pour certains types / SGBD
        # version_table_schema='dbo', # Pour SQL Server, si vous voulez la table alembic_version dans dbo
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    # Crée un engine basé sur la configuration dans alembic.ini
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}), # Lit la section [alembic]
        prefix="sqlalchemy.", # Cherche les clés comme sqlalchemy.url
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata, # Utilise VOTRE target_metadata
            # compare_type=True, # Peut être utile
            # version_table_schema='dbo', # Pour SQL Server, si vous voulez la table alembic_version dans dbo
            # include_schemas=True, # Si vous utilisez plusieurs schémas SQL Server explicitement
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()