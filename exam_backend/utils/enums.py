from enum import Enum

class LevelType(Enum):
    PRIMARY = "quiz"
    SECONDARY = "secondary"
    TERTIARY = "tertiary"

    @classmethod
    def values(cls):
        """Return all enum values as a list."""
        return [flag.value for flag in cls]

    @classmethod
    def choices(cls):
        """Return choices tuple for Django models."""
        return [(flag.value, flag.value.capitalize()) for flag in cls]