DEFAULT_LIMIT = 20
MAX_LIMIT = 100


def normalize(offset: int, limit: int) -> tuple[int, int]:
    return max(offset, 0), min(max(limit, 1), MAX_LIMIT)
