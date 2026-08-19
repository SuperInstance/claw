use claw_core::{NaiveSpatialIndex, SpatialIndex, SpatialEntry, DodecetPosition};
use uuid::Uuid;

// ---------------------------------------------------------------------------
// Spatial index baseline tests (Phase 6)
// ---------------------------------------------------------------------------

#[test]
fn test_naive_spatial_index_insert_and_query() {
    let mut index = NaiveSpatialIndex::new();
    let center = DodecetPosition { x: 100, y: 100, z: 100, theta: 0 };
    let nearby = DodecetPosition { x: 105, y: 100, z: 100, theta: 0 };

    index.insert(SpatialEntry::new(Uuid::new_v4(), nearby));

    let results = index.query_radius(center, 10.0);
    assert_eq!(results.len(), 1);
    assert_eq!(results[0].position, nearby);
}

#[test]
fn test_spatial_index_remove() {
    let mut index = NaiveSpatialIndex::new();
    let id = Uuid::new_v4();
    let pos = DodecetPosition { x: 0, y: 0, z: 0, theta: 0 };

    index.insert(SpatialEntry::new(id, pos));
    assert_eq!(index.query_radius(pos, 1.0).len(), 1);

    let removed = index.remove(id);
    assert!(removed.is_some());
    assert_eq!(index.query_radius(pos, 1.0).len(), 0);
}

#[test]
fn test_spatial_index_knn() {
    let mut index = NaiveSpatialIndex::new();
    let center = DodecetPosition { x: 0, y: 0, z: 0, theta: 0 };

    for offset in [1, 5, 10, 20].iter() {
        index.insert(SpatialEntry::new(
            Uuid::new_v4(),
            DodecetPosition { x: *offset, y: 0, z: 0, theta: 0 },
        ));
    }

    let knn = index.query_knn(center, 2);
    assert_eq!(knn.len(), 2);
    // Nearest should be offset 1, then 5
    assert_eq!(knn[0].position.x, 1);
    assert_eq!(knn[1].position.x, 5);
}

#[test]
fn test_spatial_index_empty_queries() {
    let index = NaiveSpatialIndex::new();
    let center = DodecetPosition { x: 0, y: 0, z: 0, theta: 0 };

    assert!(index.query_radius(center, 100.0).is_empty());
    assert!(index.query_knn(center, 5).is_empty());
}

#[test]
fn test_spatial_index_duplicate_insert_replaces() {
    let mut index = NaiveSpatialIndex::new();
    let id = Uuid::new_v4();
    let pos1 = DodecetPosition { x: 0, y: 0, z: 0, theta: 0 };
    let pos2 = DodecetPosition { x: 50, y: 50, z: 50, theta: 0 };

    index.insert(SpatialEntry::new(id, pos1));
    index.insert(SpatialEntry::new(id, pos2));

    let results = index.query_radius(pos2, 1.0);
    assert_eq!(results.len(), 1);
    assert_eq!(results[0].position, pos2);

    // old position should no longer be present
    let old_results = index.query_radius(pos1, 1.0);
    assert!(old_results.is_empty());
}
