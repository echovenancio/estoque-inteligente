from config import settings

from database.generic_repository import GenericDBManager


def get_db_manager() -> GenericDBManager:
    from database.sqlite_service import DevDBManager
    from database.firestore_service import FirestoreDBManager

    if settings.env == "dev" or settings.env == "test":
        return DevDBManager()
    else:
        return FirestoreDBManager()
