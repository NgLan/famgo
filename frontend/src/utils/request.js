const API_URL = import.meta.env.VITE_API_URL; 
const API_DOMAIN = `${API_URL}/api/`;
export const get = async (path) => {
  const response = await fetch(API_DOMAIN + path);
  const result = await response.json();
  return result;
}
export const post = async (path, option) => {
  const response = await fetch(API_DOMAIN + path, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(option),
  });
  const result = await response.json();
  return result;
}

export const postt = async (path, option) => {
  const response = await fetch(API_DOMAIN + path, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(option),
  });

  // Kiểm tra xem response có thành công không
  if (!response.ok) {
    // Thử đọc message từ response (nếu có)
    const errorText = await response.text();
    throw new Error(`Lỗi API: ${response.status} - ${errorText}`);
  }

  // Nếu ok, trả về kết quả
  const result = await response.json();
  return result;
};

export const patch = async (path, option) => {
  const response = await fetch(API_DOMAIN + path, {
    method: "PATCH",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(option),
  });
  const result = await response.json();
  return result;
}
export const put = async (path, option) => {
  const response = await fetch(API_DOMAIN + path, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(option),
  });
  const result = await response.json();
  return result;
};
export const del = async (path) => {
  const response = await fetch(API_DOMAIN + path, {
    method: "DELETE",
  });
  const result = await response.json();
  return result;
}
export const dell = async (path, option) => {
  const response = await fetch(API_DOMAIN + path, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(option) // 👈 truyền dữ liệu vào body
  });
  const result = await response.json();
  return result;
};
