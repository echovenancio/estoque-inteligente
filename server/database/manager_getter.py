from config import settings

from database.generic_repository import GenericDBManager

def get_db_manager() -> GenericDBManager:
    from database.sqlite_repository import DevDBManager
    from database.firestore_repository import FirestoreDBManager

    if settings.env == 'dev' or settings.env == 'test':
        return DevDBManager()
    else:
        return FirestoreDBManager()
