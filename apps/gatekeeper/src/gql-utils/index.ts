import { parse, Entity } from './model';
// import diff from 'microdiff';

// KONNECT: Gatekeeper
export const isSubset = (A: string, B: string): boolean => {
  const astA = parse(A);
  const astB = parse(B);
  let subset = true;
  astB.forEach((entity, name) => {
    // console.log(name)
    if (!isEntitySubset(astA.get(name), entity)) {
      subset = false;
    }
  });
  return subset;
};

function isEntitySubset(A: Entity | undefined, B: Entity | undefined): boolean {
  if (!A) {
    return false;
  }
  if (!B) {
    return true;
  }

  // console.log(A.name, B.name, A.entities, B.entities)

  for (const fB of B.fields) {
    // console.log(fB)
    let exists = false;
    for (const fA of A.fields) {
      if (fA === fB) {
        exists = true;
        break;
      }
    }
    if (!exists) {
      return false;
    }
  }

  for (const id of Array.from(B.entities.keys())) {
    const entity = B.entities.get(id);
    if (A.entities.has(id)) {
      if (!isEntitySubset(A.entities.get(id), entity)) {
        return false;
      }
    } else {
      return false;
    }
  }

  return true;
}
