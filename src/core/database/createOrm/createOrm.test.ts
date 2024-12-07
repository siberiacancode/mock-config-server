import type { Orm } from '@/utils/types';

import { createStorage } from '../createStorage/createStorage';

import { createOrm } from './createOrm';

describe('createOrm', () => {
  describe('createOrm: shallow orm', () => {
    interface User {
      name: string;
      age: number;
      address: { city: string };
      hobbies: string[];
    }
    let orm = {} as Orm<{ users: User[] }>;

    beforeEach(() => {
      const data = {
        users: [
          {
            name: 'John Doe',
            age: 25,
            address: { city: 'Novosibirsk' },
            hobbies: ['music', 'sport']
          },
          { name: 'Jane Smith', age: 30, address: { city: 'Tomsk' }, hobbies: ['sport', 'games'] }
        ]
      };
      const storage = createStorage(data);
      orm = createOrm(storage) as unknown as Orm<typeof data>;
    });
    test('Should get value', () => {
      const collection = orm.users.get();
      expect(collection).toStrictEqual([
        {
          name: 'John Doe',
          age: 25,
          address: { city: 'Novosibirsk' },
          hobbies: ['music', 'sport']
        },
        { name: 'Jane Smith', age: 30, address: { city: 'Tomsk' }, hobbies: ['sport', 'games'] }
      ]);
    });

    test('Should update value', () => {
      const collection = orm.users.get();
      expect(collection).toStrictEqual([
        {
          name: 'John Doe',
          age: 25,
          address: { city: 'Novosibirsk' },
          hobbies: ['music', 'sport']
        },
        { name: 'Jane Smith', age: 30, address: { city: 'Tomsk' }, hobbies: ['sport', 'games'] }
      ]);

      orm.users.update([]);

      const updatedCollection = orm.users.get();
      expect(updatedCollection).toStrictEqual([]);
    });
  });

  describe('createOrm: nested orm', () => {
    interface User {
      id: number;
      name: string;
      age: number;
      address: { city: string };
      hobbies: string[];
    }
    let orm = {} as Orm<{ users: User[] }>;

    beforeEach(() => {
      const data = {
        users: [
          {
            id: 1,
            name: 'John Doe',
            age: 25,
            address: { city: 'Novosibirsk' },
            hobbies: ['music', 'sport']
          },
          {
            id: 2,
            name: 'Jane Smith',
            age: 30,
            address: { city: 'Tomsk' },
            hobbies: ['sport', 'games']
          }
        ]
      };

      const storage = createStorage(data);
      orm = createOrm(storage) as unknown as Orm<typeof data>;
    });

    test('Should get value', () => {
      const users = orm.users.get();
      expect(users).toStrictEqual([
        {
          id: 1,
          name: 'John Doe',
          age: 25,
          address: { city: 'Novosibirsk' },
          hobbies: ['music', 'sport']
        },
        {
          id: 2,
          name: 'Jane Smith',
          age: 30,
          address: { city: 'Tomsk' },
          hobbies: ['sport', 'games']
        }
      ]);
    });

    test('Should find by id', () => {
      const user = orm.users.findById(1);
      expect(user).toStrictEqual({
        id: 1,
        name: 'John Doe',
        age: 25,
        address: { city: 'Novosibirsk' },
        hobbies: ['music', 'sport']
      });

      const undef = orm.users.findById(999);
      expect(undef).toBeUndefined();
    });

    test('Should find many with filters', () => {
      const users = orm.users.findMany({ age: 25 });
      expect(users).toStrictEqual([
        {
          id: 1,
          name: 'John Doe',
          age: 25,
          address: { city: 'Novosibirsk' },
          hobbies: ['music', 'sport']
        }
      ]);
    });

    test('Should check existence', () => {
      const exists = orm.users.exists({ name: 'John Doe' });
      expect(exists).toBe(true);

      const notExists = orm.users.exists({ name: 'Non Exist' });
      expect(notExists).toBe(false);
    });

    test('Should count the number of resourses', () => {
      const count = orm.users.count();
      expect(count).toBe(2);
    });

    test('Should create a new resource', () => {
      const newUser = {
        name: 'Bob Marley',
        age: 35,
        address: { city: 'London' },
        hobbies: ['music', 'sports']
      };
      orm.users.create(newUser);

      const users = orm.users.get();
      expect(users.length).toBe(3);
      expect(users[2]).toStrictEqual({ ...newUser, id: 3 });
    });

    test('Should update a resource', () => {
      orm.users.update(1, { age: 26 });

      const updatedUser = orm.users.findById(1)!;
      expect(updatedUser.age).toBe(26);
    });

    test('Should delete a resource', () => {
      orm.users.delete(1);
      const remainingUsers = orm.users.get();

      expect(remainingUsers.length).toBe(1);
      expect(remainingUsers.find((user) => user.id === 2)).toBeUndefined();
    });

    test('Should delete many resources by ids', () => {
      orm.users.deleteMany([1, 2]);
      const remainingUsers = orm.users.get();
      expect(remainingUsers.length).toBe(0);
    });

    test('Should update many users', () => {
      orm.users.updateMany([1, 2], { age: 40 });
      const users = orm.users.get();

      expect(users).toStrictEqual([
        {
          id: 1,
          name: 'John Doe',
          age: 40,
          address: { city: 'Novosibirsk' },
          hobbies: ['music', 'sport']
        },
        {
          id: 2,
          name: 'Jane Smith',
          age: 40,
          address: { city: 'Tomsk' },
          hobbies: ['sport', 'games']
        }
      ]);
    });
  });
});
