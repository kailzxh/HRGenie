// import { supabase } from '@/config/supabase';
// import { Employee } from '@/types';

// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// const getAuthHeader = async () => {
//   const token = await auth.currentUser?.getIdToken();
//   if (!token) throw new Error('Not authenticated');
//   return {
//     'Authorization': `Bearer ${token}`
//   };
// };

// export const employeesApi = {
//   async getAll(): Promise<Employee[]> {
//     const headers = await getAuthHeader();
//     const response = await fetch(`${API_URL}/hr/employees`, { headers });
//     if (!response.ok) throw new Error('Failed to fetch employees');
//     return response.json();
//   },

//   async create(employee: Partial<Employee>): Promise<Employee> {
//     const headers = await getAuthHeader();
//     const response = await fetch(`${API_URL}/hr/employees`, {
//       method: 'POST',
//       headers: {
//         ...headers,
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(employee)
//     });
//     if (!response.ok) throw new Error('Failed to create employee');
//     return response.json();
//   },

//   async update(id: string, employee: Partial<Employee>): Promise<Employee> {
//     const headers = await getAuthHeader();
//     const response = await fetch(`${API_URL}/hr/employees/${id}`, {
//       method: 'PUT',
//       headers: {
//         ...headers,
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(employee)
//     });
//     if (!response.ok) throw new Error('Failed to update employee');
//     return response.json();
//   },

//   async delete(id: string): Promise<void> {
//     const headers = await getAuthHeader();
//     const response = await fetch(`${API_URL}/hr/employees/${id}`, {
//       method: 'DELETE',
//       headers
//     });
//     if (!response.ok) throw new Error('Failed to delete employee');
//   }
// };