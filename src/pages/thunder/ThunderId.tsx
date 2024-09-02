import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ModalCenter from '../../components/common/ModalCenter';
import ThunderImageModal from '../../components/thunder/ThunderImageModal';
import ContentLoader from 'react-content-loader';
import { format, differenceInMinutes, differenceInHours } from 'date-fns';
import { ko } from 'date-fns/locale';
import { authInstance } from '../../api/util/instance';

// ThunderId - 소셜다이닝 글 목록 조회
interface Meeting {
  uuid: string;
  title: string;
  payment_method_name: string;
  age_group_name: string;
  gender_group_name: string;
  meeting_time: string;
  meeting_image_url: string;
  description: string;
  created_at: string;
  nickname: string;
}

interface MeetingMember {
  id: number;
  profile_image_url: string;
  introduction: string;
  nickname: string;
}

const ThunderId = () => {
  const [isModalCenterOpen, setIsModalCenterOpen] = useState(false); // ModalCenter의 Open/Close 상태를 관리
  const [isThunderImageModalOpen, setIsThunderImageModalOpen] = useState(false); // ImageModal Open/Close 상태 관리
  const [isLiked, setIsLiked] = useState(false); // 좋아요 상태를 관리하는 상태
  const [isParticipating, setIsParticipating] = useState(false); // 참여 상태를 관리
  const [isParticipatingCancelModalOpen, setIsParticipatingCancelModalOpen] = useState(false); // 참여 취소 모달의 열림/닫힘 상태를 관리
  const [isImageLoaded, setIsImageLoaded] = useState(false); // 이미지 로드 상태를 관리
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null); // 선택된 모임 정보를 관리
  const [selectedImages, setSelectedImages] = useState<string[]>([]); // 선택된 이미지 URL들을 관리
  const [meetingMembers, setMeetingMembers] = useState<MeetingMember[]>([]); // 모임 멤버 정보를 관리

  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        const meetingId = window.location.pathname.split('/').pop();
        const response = await authInstance.get(`/api/meetings/${meetingId}`);
        console.log('Meeting data:', response.data.meeting);
        console.log('Meeting members:', response.data.meeting_member);
        setSelectedMeeting(response.data.meeting);
        setMeetingMembers(response.data.meeting_member);
      } catch (error) {
        console.error('모임 정보를 불러오는 중 오류가 발생했습니다:', error);
      }
    };

    fetchMeeting();
  }, []);

  if (!selectedMeeting) {
    return <div>모임 정보를 불러올 수 없습니다.</div>;
  }

  // 참여 하기 modal
  const openModalCenter = () => setIsModalCenterOpen(true);
  const closeModalCenter = () => setIsModalCenterOpen(false);

  // 참여 취소 modal
  const openCancelModal = () => setIsParticipatingCancelModalOpen(true);
  const closeCancelModal = () => setIsParticipatingCancelModalOpen(false);

  // 참여 확인 handler
  const handleConfirmParticipation = async () => {
    try {
      const meetingId = window.location.pathname.split('/').pop();
      await authInstance.post(`/api/meetings/${meetingId}/join`, { is_host: false });
      setIsParticipating(true);
      closeModalCenter();
    } catch (error) {
      console.error('참여 확인 중 오류가 발생했습니다:', error);
    }
  };

  // 참여 취소 handler
  const handleCancelParticipation = () => {
    setIsParticipating(false);
    closeCancelModal();
  };

  // 좋아요 toggle
  const toggleLike = () => {
    setIsLiked(!isLiked);
  };

  // 이미지 modal 열기
  const openThunderImageModal = () => {
    setSelectedImages([selectedMeeting.meeting_image_url]);
    setIsThunderImageModalOpen(true);
  };
  const closeThunderImageModal = () => setIsThunderImageModalOpen(false);

  // 작성 시간 포맷팅 함수
  const formatCreatedAt = (createdAt: string) => {
    const now = new Date();
    const createdDate = new Date(createdAt);
    const minutesDifference = differenceInMinutes(now, createdDate);
    const hoursDifference = differenceInHours(now, createdDate);
    if (minutesDifference < 1) {
      return '방금 전';
    } else if (minutesDifference < 60) {
      return `${Math.floor(minutesDifference)}분 전`;
    } else if (hoursDifference < 24) {
      return `${Math.floor(hoursDifference)}시간 전`;
    } else {
      return format(createdDate, 'M월 d일', { locale: ko });
    }
  };

  return (
    <div className="relative mx-auto max-w-full rounded-lg bg-white p-4">
      {/* 모임 제목 */}
      <div className="mb-4 text-xl font-bold">{selectedMeeting.title}</div>

      {/* 모임 정보 */}
      <div className="mb-4 flex items-center text-sm text-gray-500">
        {/* 결제 방식 */}
        <div className="mr-2 rounded-md border-2 border-gray-200 bg-slate-100 px-2 py-1 text-black">
          {selectedMeeting.payment_method_name}
        </div>

        {/* 연령대 */}
        <div className="mr-2 rounded-md border-2 border-gray-200 bg-slate-100 px-2 py-1 text-black">
          {selectedMeeting.age_group_name}
        </div>

        {/* 성별 */}
        <div className="mr-2 rounded-md border-2 border-gray-200 bg-slate-100 px-2 py-1 text-black">
          {selectedMeeting.gender_group_name}
        </div>
      </div>
      {/* 작성자 정보 */}
      <div className="mb-4 flex items-center">
        <Link to={`/profile/${selectedMeeting.nickname}`}>
          <img src="../images/anonymous_avatars.svg" alt="프로필 사진" className="mr-2 h-10 w-10 rounded-full" />
        </Link>
        <div>
          <div className="flex items-center">
            <Link to={`/profile/${selectedMeeting.nickname}`} className="text-sm font-medium">
              {selectedMeeting.nickname}
            </Link>
            <div className="ml-2 text-xs font-medium text-gray-500">{formatCreatedAt(selectedMeeting.created_at)}</div>
          </div>
        </div>
      </div>
      {/* 모임 일정 */}
      <div className="mb-4 flex h-full w-full items-center rounded-[11.5px] border-2 border-[#ffe7e2] text-sm text-gray-500">
        <img src="../images/ThunderCalender.svg" alt="캘린더" className="mr-[10px] h-[70px] w-[70px]" />
        <p className="ml-2 text-[14px] text-[#333333]">{new Date(selectedMeeting.meeting_time).toLocaleString()}</p>
      </div>
      {/* 모임 설명 */}
      <p className="mb-4 text-[#333333]">{selectedMeeting.description}</p>
      {/* <hr className="mb-5 mt-5 border border-gray-200" /> */}
      {/* 이미지 불러올 때  content-loader 표시*/}
      {selectedMeeting.meeting_image_url && !isImageLoaded && (
        <ContentLoader height={200} width={300} speed={2} backgroundColor="#f3f3f3" foregroundColor="#ecebeb">
          <rect x="0" y="56" rx="3" ry="3" width="300" height="10" />
          <rect x="0" y="72" rx="3" ry="3" width="200" height="10" />
          <rect x="0" y="88" rx="3" ry="3" width="100" height="10" />
        </ContentLoader>
      )}
      {/* 이미지 불러오기 완료 후 나오는 이미지 경로 */}
      {selectedMeeting.meeting_image_url && (
        <img
          src={selectedMeeting.meeting_image_url}
          alt="소셜다이닝 게시판 이미지"
          className={`mb-4 mt-8 h-full w-full cursor-pointer rounded-lg object-cover ${isImageLoaded ? 'block' : 'hidden'}`}
          onLoad={() => setIsImageLoaded(true)}
          onClick={() => openThunderImageModal()}
        />
      )}
      {/* 이미지 모달 - 이미지를 선택하면 modal open, 사용자는 옆으로 스크롤 하여 이미지를 볼 수 있다.*/}
      <ThunderImageModal isOpen={isThunderImageModalOpen} onClose={closeThunderImageModal} images={selectedImages} />

      <hr className="mb-5 mt-5 border-2 border-gray-200" />
      {/* 같이 드실 멤버 */}
      <div className="mb-4 flex items-center">
        <div className="text-sm font-bold">같이 드실 멤버</div>
      </div>
      {/* 같이 드실 멤버 프로필 */}
      {meetingMembers.map((member) => (
        <div key={member.id} className="mb-4 flex items-center">
          <Link to={`/profile/${member.nickname}`}>
            <img
              src={member.profile_image_url}
              alt="같이 드실 멤버 프로필 사진"
              className="mr-2 h-10 w-10 rounded-full"
              onError={(e) => {
                (e.target as HTMLImageElement).onerror = null;
                (e.target as HTMLImageElement).src = '../images/anonymous_avatars.svg';
              }}
            />
          </Link>
          <div>
            <Link to={`/profile/${member.nickname}`} className="text-sm font-medium">
              {member.nickname}
            </Link>
            <p className="text-xs text-gray-500">{member.introduction}</p>
          </div>
        </div>
      ))}

      <div className="flex bg-white">
        {/* 좋아요 button */}
        <motion.img
          src={isLiked ? '../images/SocialDiningLikeActive.svg' : '../images/SocialDiningLike.svg'}
          alt="좋아요"
          className="cursor-pointer rounded-lg text-white"
          onClick={toggleLike}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 1 }}
        />

        {isParticipating ? (
          <div className="flex items-center justify-between">
            {/* 참가 취소 button */}
            <motion.button
              onClick={openCancelModal}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 1 }}
              className="ml-4 flex h-[50px] w-[250px] items-center justify-center rounded-lg border-2 border-orange-400 font-bold text-orange-500 hover:bg-orange-50 xs:w-[130px]">
              참가 취소
            </motion.button>

            {/* 참가 취소 button을 누르면 나오는 modal */}
            <ModalCenter
              isOpen={isParticipatingCancelModalOpen}
              onClose={closeCancelModal}
              title1="참여를 취소하시겠습니까?"
              title2="">
              <div className="mt-12 flex w-full space-x-4">
                {/* 취소 버튼 */}
                <motion.button
                  onClick={closeCancelModal}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 1 }}
                  className="w-full flex-1 rounded-xl border-2 border-orange-400 px-1 py-2 font-semibold text-orange-500 hover:bg-orange-50">
                  취소
                </motion.button>

                {/* 참여하기 버튼 을 누르면 나오는 modal 에서 확인 button */}
                <motion.button
                  onClick={handleCancelParticipation}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 1 }}
                  className="w-full flex-1 rounded-xl bg-orange-500 px-2 py-3 font-semibold text-white hover:bg-orange-600">
                  확인
                </motion.button>
              </div>
            </ModalCenter>

            <motion.button />
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 1 }}>
              <Link
                to={`/thunder/thunderchat/${selectedMeeting.uuid}`}
                className="ml-2 flex h-[50px] w-[270px] items-center justify-center rounded-lg bg-orange-500 font-bold text-white hover:bg-orange-600 xs:w-[145px]">
                소통방
              </Link>
            </motion.div>
          </div>
        ) : (
          <motion.button
            onClick={openModalCenter}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 1 }}
            className="ml-3 flex h-[50px] w-full items-center justify-center rounded-lg bg-orange-500 font-bold text-white hover:bg-orange-600">
            참여하기 (1/3)
          </motion.button>
        )}

        {/*  참여하기 버튼 누를 시 ModalCenter Open*/}
        <ModalCenter isOpen={isModalCenterOpen} onClose={closeModalCenter} title1="참여하시겠습니까?" title2="">
          <div className="mt-12 flex w-full space-x-4">
            <motion.button
              onClick={closeModalCenter}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 1 }}
              className="w-full flex-1 rounded-xl border-2 border-orange-400 px-1 py-2 font-semibold text-orange-500 hover:bg-orange-50">
              취소
            </motion.button>

            {/* 확인 버튼을 클릭하면 참여 확인 handler 실행 */}
            <motion.button
              onClick={handleConfirmParticipation}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 1 }}
              className="w-full flex-1 rounded-xl bg-orange-500 px-2 py-3 font-semibold text-white hover:bg-orange-600">
              확인
            </motion.button>
          </div>
        </ModalCenter>
      </div>
    </div>
  );
};

export default ThunderId;
