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
      orm = createOrm<typeof data>(storage);
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
          },
          { id: 3, name: 'Will Smith', age: 27, address: { city: 'Moscow' }, hobbies: ['music'] }
        ]
      };

      const storage = createStorage(data);
      orm = createOrm<typeof data>(storage);
    });

    test('Should create many new resources', () => {
      const newUser = {
        name: 'Bob Marley',
        age: 35,
        address: { city: 'London' },
        hobbies: ['music', 'sports']
      };
      const createdUser = orm.users.create(newUser);

      const users = orm.users.findMany();
      expect(users.length).toBe(4);
      expect(createdUser).toStrictEqual({ ...newUser, id: 4 });
    });

    test('Should update a resource', () => {
      orm.users.update(1, { age: 26 });

      const updatedUser = orm.users.findById(1)!;
      expect(updatedUser.age).toBe(26);
    });

    test('Should delete a resource', () => {
      orm.users.delete(1);
      const remainingUsers = orm.users.findMany();

      expect(remainingUsers.length).toBe(2);
      expect(remainingUsers.find((user) => user.id === 1)).toBeUndefined();
    });

    test('Should create many new resources', () => {
      const newUsers = [
        {
          name: 'Bob Marley',
          age: 35,
          address: { city: 'London' },
          hobbies: ['music', 'sports']
        },
        {
          name: 'Jorge Luis',
          age: 35,
          address: { city: 'London' },
          hobbies: ['music', 'sports']
        }
      ];
      orm.users.createMany(newUsers);

      const users = orm.users.findMany();
      expect(users.length).toBe(5);
      expect([users[3], users[4]]).toStrictEqual([
        { ...newUsers[0], id: 4 },
        { ...newUsers[1], id: 5 }
      ]);
    });

    test('Should update many resources', () => {
      const usersLength = orm.users.updateMany([1, 2], { age: 40 });
      const users = orm.users.findMany();

      expect(usersLength).toBe(2);
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
        },
        { id: 3, name: 'Will Smith', age: 27, address: { city: 'Moscow' }, hobbies: ['music'] }
      ]);
    });

    test('Should delete many resources by ids', () => {
      orm.users.deleteMany([1, 2]);
      const remainingUsers = orm.users.findMany();
      expect(remainingUsers.length).toBe(1);
      expect(remainingUsers).toStrictEqual([
        { id: 3, name: 'Will Smith', age: 27, address: { city: 'Moscow' }, hobbies: ['music'] }
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

      const undefinedUser = orm.users.findById(999);
      expect(undefinedUser).toBeUndefined();
    });

    test('Should find many', () => {
      const users = orm.users.findMany();
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
        },
        { id: 3, name: 'Will Smith', age: 27, address: { city: 'Moscow' }, hobbies: ['music'] }
      ]);
    });

    test('Should find many by filters', () => {
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

    test('Should find first', () => {
      const user = orm.users.findFirst();
      expect(user).toStrictEqual({
        id: 1,
        name: 'John Doe',
        age: 25,
        address: { city: 'Novosibirsk' },
        hobbies: ['music', 'sport']
      });
    });

    test('Should find first by filters', () => {
      const user = orm.users.findFirst({ id: 2 });
      expect(user).toStrictEqual({
        id: 2,
        name: 'Jane Smith',
        age: 30,
        address: { city: 'Tomsk' },
        hobbies: ['sport', 'games']
      });
    });

    test('Should check existence', () => {
      const exists = orm.users.exists({ name: 'John Doe' });
      expect(exists).toBe(true);

      const notExists = orm.users.exists({ name: 'Non Exist' });
      expect(notExists).toBe(false);
    });

    test('Should count the number of resourses', () => {
      const count = orm.users.count();
      expect(count).toBe(3);
    });
  });
});
